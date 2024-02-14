import { describe, expect, beforeEach, afterEach, beforeAll, afterAll, it } from '@jest/globals';
import { connectDB, dropCollections, dropDB } from './util';
import Cache from '../../src/Util/cache';
import request from "supertest";
import { makeServer } from '../../src/Util/Factories';
import { eventPrivateUrl, categoryPrivateUrl, newValidOrganizer, newValidUser, sighupUrl, newValidCategory } from './common';
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

        describe("WHEN Login in as a Organizer", () => {
            var organizer: IOrganizer;
            var accessToken: string;

            beforeEach(async () => {
                const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer);
                organizer = response.body;
                accessToken = response.header.authorization.split(" ")[1];
            })

            describe("WHEN the Category is Valid", () => {

                it("SHOULD return a 200 status code AND category obj", async () => {
                    const response = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send(newValidCategory);
                    expect(response.status).toBe(200);
                    expect(response.body.body).toMatchObject({ ...newValidCategory, id: expect.any(String) });
                });


            });

            describe("WHEN  the Category is Invalid", () => {
                it("SHOULD return a 400 status code AND Error obj", async () => {
                    const response = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send({});
                    expect(response.status).toBe(400);
                    expect(response.body.body).toBeUndefined();
                    expect(response.body.error).toMatchObject({ msg: expect.any(String) });
                });

            });

        });

    });

});