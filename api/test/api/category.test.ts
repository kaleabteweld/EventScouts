import { describe, expect, beforeEach, afterEach, beforeAll, afterAll, it } from '@jest/globals';
import { connectDB, dropCollections, dropDB } from './util';
import Cache from '../../src/Util/cache';
import request from "supertest";
import { makeServer } from '../../src/Util/Factories';
import { eventPrivateUrl, categoryPrivateUrl, newValidOrganizer, newValidUser, sighupUrl, newValidCategory, categoryPublicUrl } from './common';
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
                const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer);
                organizer = response.body;
                accessToken = response.header.authorization.split(" ")[1];
            })

            describe("WHEN  the Category is Invalid", () => {

                describe("WHEN  the Category has a Repeated name", () => {

                    it("SHOULD return a 400 status code AND Error obj", async () => {
                        await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send(newValidCategory);
                        const response = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send(newValidCategory);

                        expect(response.status).toBe(400);
                        expect(response.body.body).toBeUndefined();
                        expect(response.body.error).toMatchObject({ msg: expect.any(String) });
                    });


                });

                it("SHOULD return a 400 status code AND Error obj", async () => {
                    const response = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send({});
                    expect(response.status).toBe(400);
                    expect(response.body.body).toBeUndefined();
                    expect(response.body.error).toMatchObject({ msg: expect.any(String) });
                });


            });


            describe("WHEN the Category is Valid", () => {

                it("SHOULD return a 200 status code AND category obj", async () => {
                    const response = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send(newValidCategory);
                    expect(response.status).toBe(200);
                    expect(response.body.body).toMatchObject({ ...newValidCategory, id: expect.any(String) });
                });


            });

        });
        describe("WHEN not Login in as a Organizer", () => {
            it("SHOULD return a 401 status code AND Error obj", async () => {
                const response = await request(app).post(categoryPrivateUrl()).send({});
                console.log({ body: response.body });
                expect(response.status).toBe(401);
                expect(response.body.body).toBeUndefined();
                expect(response.body.error).toMatchObject({ msg: expect.any(String) });
            });

            describe("WHEN Login in as a User", () => {

                var user: IUser;
                var accessToken: string;

                beforeEach(async () => {
                    const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                    user = response.body;
                    accessToken = response.header.authorization.split(" ")[1];
                })

                it("SHOULD return a 401 status code AND Error obj", async () => {
                    const response = await request(app).post(categoryPrivateUrl()).set('authorization', `Bearer ${accessToken}`).send({});
                    expect(response.status).toBe(401);
                    expect(response.body.body).toBeUndefined();
                    expect(response.body.error).toMatchObject({ msg: expect.any(String) });
                })
            })

        });

    });

    describe("Get Categorys", () => {

        var categorys: ICategory[] = [];
        var accessToken: string;


        beforeEach(async () => {
            const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer);
            accessToken = response.header.authorization.split(" ")[1];

            categorys = [];
            let categoryResponse = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send(newValidCategory);
            categorys.push(categoryResponse.body.body)

            categoryResponse = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send({ ...newValidCategory, name: "Category2" });
            categorys.push(categoryResponse.body.body)

        })

        describe("WHEN trying to get Categorys by Pagination {skip}/{limit}", () => {

            it("SHOULD return a list of Categorys Bigger then 1 and less then 3", async () => {
                const response = await request(app).get(`${categoryPublicUrl()}list/0/3`).send();
                expect(response.status).toBe(200)

                expect(response.body.body.length).toBeGreaterThan(0)
                expect(response.body.body.length).toBeLessThan(3)
            })

        });

        describe("WHEN trying to get Categorys by category id", () => {

            describe("WHEN trying to get Categorys by valid category id", () => {

                it("SHOULD return the Categorys with that id", async () => {

                    const response = await request(app).get(`${categoryPublicUrl()}byId/${categorys[0].id}`).send();

                    expect(response.status).toBe(200);
                    expect(response.body.body).toMatchObject({ ...newValidCategory, id: expect.any(String) });
                })
            })

            describe("WHEN trying to get Category by InValid category id", () => {
                it("SHOULD return 404 with error obj", async () => {
                    const response = await request(app).get(`${categoryPublicUrl()}byId/75cfba229d3e6fb530a1d4d5`).send();

                    expect(response.status).toBe(404)

                    expect(response.body.body).toBeUndefined();
                    expect(response.body.error).toMatchObject({ msg: expect.any(String) });
                });
            })
        })

    });
});