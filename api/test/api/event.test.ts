import { describe, expect, beforeEach, afterEach, beforeAll, afterAll, it } from '@jest/globals';
import { connectDB, dropCollections, dropDB } from './util';
import Cache from '../../src/Util/cache';
import request from "supertest";
import { makeServer } from '../../src/Util/Factories';
import { eventPrivateUrl, eventPublicUrl, newValidOrganizer, newValidUser, sighupUrl } from './common';
import { IOrganizer } from '../../src/Schema/Types/organizer.schema.types';
import { UserType } from '../../src/Types';
import { IUser } from '../../src/Schema/Types/user.schema.types';

const app = makeServer();


describe('Event', () => {

    beforeAll(() => {
        return Promise.all([connectDB(), Cache.connect()]);
    });

    afterAll(() => {
        return Promise.all([dropDB(), Cache.disconnect()]);
    });

    afterEach(async () => {
        return await dropCollections();
    });

    describe("Creating Event", () => {

        describe("WHEN not Login in as a Organizer", () => {
            it("SHOULD return a 401 status code AND Error obj", async () => {
                const response = await request(app).post(eventPrivateUrl()).send({});
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

                it("SHOULD return a 400 status code AND Error obj", async () => {
                    const response = await request(app).post(eventPrivateUrl()).set('authorization', `Bearer ${accessToken}`).send({});
                    expect(response.status).toBe(400);
                    expect(response.body.body).toBeUndefined();
                    expect(response.body.error).toMatchObject({ msg: expect.any(String) });
                })
            })

        });

        // describe("WHEN Login in as a Organizer", () => {
        //     var organizer: IOrganizer;
        //     var accessToken: string;

        //     beforeEach(async () => {
        //         const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer);
        //         organizer = response.body;
        //         accessToken = response.header.authorization.split(" ")[1];
        //     })

        //     // describe.skip("AND the event is valid", () => {

        //     //     describe("WHEN vlad category", () => {
        //     //         let event: Event;
        //     //         let category: Category;

        //     //         beforeAll(async () => {
        //     //             const categoryResponse = await request(app).post(`/Api/v1/public/category/`).send({ name: "Test Category" });
        //     //             category = categoryResponse.body.body;
        //     //         });

        //     //         it("SHOULD return a 200 status code AND event obj With category", async () => {
        //     //             const response = await request(app).post(privateeventPrivateUrl).set("Authorization", `Bearer ${organizerToken}`).send(makeEvent({ category: [category.id] }));
        //     //             expect(response.status).toBe(200);
        //     //             expect(response.body.body).toMatchObject({
        //     //                 ...makeEvent({}),
        //     //                 category: expect.arrayContaining([expect.objectContaining({ name: "Test Category" })]),
        //     //                 organizer: expect.objectContaining({ id: organizer.id }),
        //     //                 startDate: expect.any(String),
        //     //                 endDate: expect.any(String),
        //     //             });
        //     //             event = response.body.body;
        //     //         });


        //     //         afterAll(async () => {
        //     //             await request(app).delete(`/Api/v1/public/category/${category.id}`);
        //     //             await request(app).delete(privateeventPrivateUrl + organizer.id).set("Authorization", `Bearer ${organizerToken}`);
        //     //         });


        //     //     });

        //     //     describe("With invald category", () => {
        //     //         it("SHOULD return a 400 status code AND Error obj", async () => {
        //     //             const response = await request(app).post(privateeventPrivateUrl).set("Authorization", `Bearer ${organizerToken}`).send(makeEvent({ category: ["abc123"] }));
        //     //             expect(response.status).toBe(400);
        //     //             expect(response.body.body).toBeUndefined();
        //     //             expect(response.body.error).toMatchObject({ msg: expect.any(String) });
        //     //         });

        //     //         it("No category SHOULD return a 200 status code AND event obj With [] category", async () => {
        //     //             const response = await request(app).post(privateeventPrivateUrl).set("Authorization", `Bearer ${organizerToken}`).send(makeEvent({}));
        //     //             expect(response.status).toBe(200);
        //     //             expect(response.body.body).toMatchObject({
        //     //                 ...makeEvent({}),
        //     //                 category: expect.arrayContaining([]),
        //     //                 organizer: expect.objectContaining({ id: organizer.id }),
        //     //                 startDate: expect.any(String),
        //     //                 endDate: expect.any(String),
        //     //             });
        //     //         });
        //     //     });

        //     // });

        //     // describe("AND the event is invalid", () => {

        //     //     describe("With vald category", () => {
        //     //         let category: Category;

        //     //         beforeAll(async () => {
        //     //             const categoryResponse = await request(app).post(`/Api/v1/public/category/`).send({ name: "Test Category" });
        //     //             category = categoryResponse.body.body;
        //     //         });

        //     //         it("SHOULD return a 418 status code AND Error Obj", async () => {
        //     //             const response = await request(app).post(privateeventPrivateUrl).set("Authorization", `Bearer ${organizerToken}`).send({});
        //     //             expect(response.status).toBe(418);
        //     //             expect(response.body.body).toBeUndefined();
        //     //             expect(response.body.error).toMatchObject({ msg: expect.any(String) });
        //     //         });


        //     //         afterAll(async () => {
        //     //             await request(app).delete(`/Api/v1/public/category/${category.id}`);
        //     //             await request(app).delete(privateeventPrivateUrl + organizer.id).set("Authorization", `Bearer ${organizerToken}`);
        //     //         });


        //     //     });

        //     //     describe("With invald category", () => {
        //     //         it("SHOULD return a 418 status code AND Error obj", async () => {
        //     //             const response = await request(app).post(privateeventPrivateUrl).set("Authorization", `Bearer ${organizerToken}`).send({});
        //     //             expect(response.status).toBe(418);
        //     //             expect(response.body.body).toBeUndefined();
        //     //             expect(response.body.error).toMatchObject({ msg: expect.any(String) });
        //     //         });
        //     //     });

        //     // });


        // });

    });

});