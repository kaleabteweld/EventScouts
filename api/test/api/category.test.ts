import { describe, expect, beforeEach, afterEach, beforeAll, afterAll, it } from '@jest/globals';
import { connectDB, dropCollections, dropDB } from './util';
import Cache from '../../src/Util/cache';
import request from "supertest";
import { makeServer } from '../../src/Util/Factories';
import { categoryPrivateUrl, newValidOrganizer, newValidUser, sighupUrl, newValidCategory, categoryPublicUrl, newValidOrganizer2, createOrganizer, expectValidCategory, expectError, expectValidListCategory, userPrivateUrl } from './common';
import { IOrganizer } from '../../src/Schema/Types/organizer.schema.types';
import { UserType } from '../../src/Types';
import { IUser } from '../../src/Schema/Types/user.schema.types';
import { ICategory } from '../../src/Schema/Types/category.schema.types';

const app = makeServer();


describe('Category', () => {

    beforeAll(() => {
        return Promise.all([connectDB(), Cache.connect()]);
    });

    afterAll(() => {

        return Promise.all([dropDB(), Cache.disconnect()]);
    });

    afterEach(async () => {
        return await dropCollections();
    });

    describe("Creating Category", () => {

        describe("WHEN Login in as a Organizer", () => {
            var organizer: IOrganizer;
            var accessToken: string;

            beforeEach(async () => {
                const { organizers, accessTokens } = await createOrganizer(request, app, [newValidOrganizer]);
                organizer = organizers[0];
                accessToken = accessTokens[0];
            })

            describe("WHEN  the Category is Invalid", () => {

                describe("WHEN  the Category has a Repeated name", () => {

                    it("SHOULD return a 400 status code AND Error obj", async () => {
                        await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send(newValidCategory);
                        const response = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send(newValidCategory);

                        expectError(response, 400);

                    });


                });

                it("SHOULD return a 400 status code AND Error obj", async () => {
                    const response = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send({});
                    expectError(response, 400);

                });

            });

            describe("WHEN the Category is Valid", () => {

                it("SHOULD return a 200 status code AND category obj", async () => {
                    const response = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send(newValidCategory);
                    expectValidCategory(response, newValidCategory);
                });

                describe("WHEN the Category is created Organizer", () => {
                    it("SHOULD Have a list of the category obj", async () => {
                        const response = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send(newValidCategory);
                        expectValidCategory(response, newValidCategory);

                        const organizerResponse = await request(app).get(userPrivateUrl(UserType.organizer)).set("Authorization", `Bearer ${accessToken}`).send();

                        const categorys = [newValidCategory];
                        organizerResponse.body.body.categorys.forEach((category: ICategory, index: number) => {
                            expect(category).toMatchObject(expect.objectContaining({ name: categorys[index].name, id: expect.any(String) }));
                        });

                    });
                })

            });

        });
        describe("WHEN not Login in as a Organizer", () => {
            it("SHOULD return a 401 status code AND Error obj", async () => {
                const response = await request(app).post(categoryPrivateUrl()).send({});
                expectError(response, 401);
            });

            describe("WHEN Login in as a User", () => {

                var user: IUser;
                var userAccessToken: string;

                beforeEach(async () => {
                    const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                    user = response.body;
                    userAccessToken = response.header.authorization.split(" ")[1];
                })

                it("SHOULD return a 401 status code AND Error obj", async () => {
                    const response = await request(app).post(categoryPrivateUrl()).set('authorization', `Bearer ${userAccessToken}`).send({});
                    expectError(response, 401);
                })
            })

        });

    });

    describe("Get Categorys", () => {

        var categorys: ICategory[] = [];
        var accessToken: string;


        beforeEach(async () => {
            const { accessTokens } = await createOrganizer(request, app, [newValidOrganizer]);
            accessToken = accessTokens[0];

            categorys = [];
            let categoryResponse = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send(newValidCategory);
            categorys.push(categoryResponse.body.body)

            categoryResponse = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send({ ...newValidCategory, name: "Category2" });
            categorys.push(categoryResponse.body.body)

        })

        describe("WHEN trying to get Categorys by Pagination {skip}/{limit}", () => {

            it("SHOULD return a list of Categorys Bigger then 1 and less then 3", async () => {
                const response = await request(app).get(`${categoryPublicUrl()}list/0/3`).send();
                expectValidListCategory(response, [newValidCategory, { name: "Category2" }], 0, 3,);
            })

            describe("WHEN trying to get Category by valid category id With ?withEventCount=true", () => {
                it("SHOULD return the Categorys with that id and eventCount", async () => {

                    const response = await request(app).get(`${categoryPublicUrl()}list/0/3?withEventCount=true`).send();
                    expectValidListCategory(response, [newValidCategory, { name: "Category2" }], 0, 3, {
                        eventCount: 0
                    });
                })
            })

        });

        describe("WHEN trying to get Categorys by category id", () => {

            describe("WHEN trying to get Category by valid category id", () => {

                it("SHOULD return the Categorys with that id", async () => {

                    const response = await request(app).get(`${categoryPublicUrl()}byId/${categorys[0].id}`).send();
                    expectValidCategory(response, newValidCategory);
                })

                describe("WHEN trying to get Category by valid category id With ?withEventCount=true", () => {
                    it("SHOULD return the Categorys with that id and eventCount", async () => {

                        const response = await request(app).get(`${categoryPublicUrl()}byId/${categorys[0].id}?withEventCount=true`).send();
                        expectValidCategory(response, newValidCategory, {
                            eventCount: 0
                        });
                    })
                })
            })

            describe("WHEN trying to get Category by InValid category id", () => {
                it("SHOULD return 404 with error obj", async () => {
                    const response = await request(app).get(`${categoryPublicUrl()}byId/75cfba229d3e6fb530a1d4d5`).send();
                    console.log(response.body);
                    expectError(response, 404);
                });
            })
        })

    });

    describe("Remove Category", () => {
        var categorys: ICategory[] = [];
        var accessTokens: string[];

        beforeEach(async () => {
            const { accessTokens: ats } = await createOrganizer(request, app, [newValidOrganizer, newValidOrganizer2]);
            accessTokens = ats

            categorys = [];
            let categoryResponse = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessTokens[0]}`).send(newValidCategory);
            categorys.push(categoryResponse.body.body);

            categoryResponse = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessTokens[0]}`).send({ name: "Category 2" });
            categorys.push(categoryResponse.body.body);
        })

        describe("WHEN Login in as a Organizer", () => {

            describe("WHEN Organizer try to remove there category", () => {
                it("SHOULD remove and return 200 with the category", async () => {
                    let response = await request(app).delete(`${categoryPrivateUrl()}remove/${categorys[0].id}`).set('authorization', `Bearer ${accessTokens[0]}`).send({});
                    expect(response.status).toBe(200);

                    response = await request(app).get(`${categoryPublicUrl()}byId/${categorys[0].id}`).send();
                    expect(response.status).toBe(404)


                });
            });

            describe("WHEN Organizer 2 try to remove Organizer 1 category", () => {

                it("SHOULD return 401 and error object", async () => {
                    const response = await request(app).delete(`${categoryPrivateUrl()}remove/${categorys[0].id}`).set('authorization', `Bearer ${accessTokens[1]}`).send({});
                    expectError(response, 401);

                })
            })

        });

        describe("WHEN not Login in as a Organizer", () => {
            it("SHOULD return a 401 status code AND Error obj", async () => {
                const response = await request(app).delete(`${categoryPrivateUrl()}remove/${categorys[0].id}`).send({});
                expectError(response, 401);

            });

            describe("WHEN Login in as a User", () => {

                var user: IUser;
                var userAccessToken: string;

                beforeEach(async () => {
                    const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                    user = response.body;
                    userAccessToken = response.header.authorization.split(" ")[1];
                })

                it("SHOULD return a 401 status code AND Error obj", async () => {
                    const response = await request(app).delete(`${categoryPrivateUrl()}remove/${categorys[0].id}`).set('authorization', `Bearer ${userAccessToken}`).send({});
                    expectError(response, 401);
                })
            })

        });

    })
});