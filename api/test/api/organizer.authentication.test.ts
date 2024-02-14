import { IOrganizerLogInFrom, IOrganizerSignUpFrom } from "../../src/Domains/Organizer/types";
import { UserType } from "../../src/Types";
import { makeServer } from "../../src/Util/Factories";
import Cache from "../../src/Util/cache";
import { connectDB, dropCollections, dropDB, getAdjacentKey } from "./util";
import request from "supertest";
import { describe, expect, beforeEach, afterEach, beforeAll, afterAll, it } from '@jest/globals';
import { verifyAccessToken, verifyRefreshToken } from "../../src/Domains/Common/utils";
import { IOrganizer, verifiedEnum, verifiedSupportedEnum } from "../../src/Schema/Types/organizer.schema.types";
import { forgotPasswordUrl, loginUrl, logoutUrl, refreshTokenUrl, sighupUrl, verifyUserUrl, newValidOrganizer } from "./common";

const app = makeServer();


const newValidOrganizerWithOutPassword = { ...newValidOrganizer }
delete (newValidOrganizerWithOutPassword as any).password;

const ValidOrganizerLogin: IOrganizerLogInFrom = {
    email: "test@test.com",
    password: "abcd12345",
};
const VerifyOrganizerKeys = Object.values(verifiedEnum);
const VerifyOrganizerKeysSupported = Object.values(verifiedSupportedEnum);
describe('Organizer Authentication', () => {

    beforeAll(() => {
        return Promise.all([connectDB(), Cache.connect()]);
    });

    afterAll(() => {
        return Promise.all([dropDB(), Cache.disconnect()]);
    });

    afterEach(async () => {
        return await dropCollections();
    });


    describe("SignUp", () => {
        describe("WHEN Organizer enters valid inputs THEN Organizer sign up ", () => {

            it("Should return 200", async () => request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer).expect(200));

            it("Should return Organizer obj", async () => {
                const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer);
                expect(response.body).toMatchObject({ ...newValidOrganizerWithOutPassword });

            });

            describe("Should be valid Access Token in header WHEN Organizer enters valid inputs", () => {

                it("Should be set", async () => {
                    const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer);
                    expect(response.header).toHaveProperty("authorization");

                    const accessToken = response.header.authorization.split(" ")[1];
                    expect(accessToken).toBeTruthy();
                });

                it("Should be valid", async () => {
                    const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer);
                    expect(response.header).toHaveProperty("authorization");

                    const accessToken = response.header.authorization.split(" ")[1];
                    const Organizer = await verifyAccessToken(accessToken, UserType.organizer);
                    expect(Organizer).toBeTruthy();
                    expect(Organizer).toMatchObject({ ...newValidOrganizerWithOutPassword });
                });

            });

            describe("Should be valid Refresh token in header WHEN Organizer enters valid inputs", () => {

                it("Should be set", async () => {
                    const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer);
                    expect(response.header).toHaveProperty("refreshtoken");

                    const refreshToken = response.header.refreshtoken.split(" ")[1];
                    expect(refreshToken).toBeTruthy();
                });

                it("Should be set in Cache", async () => {
                    const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer);
                    expect(response.header).toHaveProperty("refreshtoken");

                    const Organizer: any = response.body;

                    const refreshToken = response.header.refreshtoken.split(" ")[1];
                    const cacheRefreshToken = await Cache.getRefreshToken(Organizer.id);

                    expect(Organizer).toBeTruthy();
                    expect(cacheRefreshToken).toBe(refreshToken);
                });

                it("Should be valid", async () => {
                    const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer);
                    expect(response.header).toHaveProperty("refreshtoken");

                    const refreshToken = response.header.refreshtoken.split(" ")[1];
                    const Organizer = await verifyRefreshToken(refreshToken, UserType.organizer);

                    expect(Organizer).toBeTruthy();
                    expect(Organizer).toMatchObject({ ...newValidOrganizerWithOutPassword });
                });

            });
        })

        describe("WHEN Organizer enters invalid inputs THEN Organizer Dose NOT sign up ", () => {

            it("should return 418", async () => request(app).post(sighupUrl(UserType.organizer)).send({}).expect(418));

            it("should return Validation error message", async () => {
                const response = await request(app).post(sighupUrl(UserType.organizer)).send({});
                expect(response.body.error).toBeDefined();

                const error = response.body.error;
                expect(error).toBeTruthy();
                expect(error).toMatchObject({ msg: expect.any(String), type: "validation", attr: expect.any(String) });
            });

            it("should not set Authentication header", async () => {
                const response = await request(app).post(sighupUrl(UserType.organizer)).send({});
                expect(response.header).not.toHaveProperty("authorization");
            });

            it("should not set Refresh token", async () => {
                const response = await request(app).post(sighupUrl(UserType.organizer)).send({});
                expect(response.header).not.toHaveProperty("refreshtoken");
            });

        });
    })

    describe("Login", () => {

        beforeEach(() => {
            return request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer)
        });

        describe("WHEN Organizer enters valid inputs THEN Organizer login ", () => {

            it("Should return 200", async () => request(app).post(loginUrl(UserType.organizer)).send(ValidOrganizerLogin).expect(200));

            it("Should return Organizer obj", async () => {
                const response = await request(app).post(loginUrl(UserType.organizer)).send(ValidOrganizerLogin);
                expect(response.body).toMatchObject({ ...newValidOrganizerWithOutPassword });
            });

            describe("WHEN Organizer enters valid inputs THEN Authentication header is set", () => {

                it("Should be set", async () => {
                    const response = await request(app).post(loginUrl(UserType.organizer)).send(ValidOrganizerLogin);
                    expect(response.header).toHaveProperty("authorization");

                    const accessToken = response.header.authorization.split(" ")[1];
                    expect(accessToken).toBeTruthy();
                });

                it("Should be valid", async () => {
                    const response = await request(app).post(loginUrl(UserType.organizer)).send(ValidOrganizerLogin);
                    expect(response.header).toHaveProperty("authorization");

                    const accessToken = response.header.authorization.split(" ")[1];
                    const Organizer = await verifyAccessToken(accessToken, UserType.organizer);
                    expect(Organizer).toBeTruthy();

                    expect(response.body).toMatchObject({ ...newValidOrganizerWithOutPassword });
                });

            });

            describe("WHEN Organizer enters valid inputs THEN Refresh token is set", () => {

                it("Should be set", async () => {
                    const response = await request(app).post(loginUrl(UserType.organizer)).send(ValidOrganizerLogin);
                    expect(response.header).toHaveProperty("refreshtoken");

                    const refreshToken = response.header.refreshtoken.split(" ")[1];
                    expect(refreshToken).toBeTruthy();
                });

                it("Should be set in Cache", async () => {
                    const response = await request(app).post(loginUrl(UserType.organizer)).send(ValidOrganizerLogin);
                    expect(response.header).toHaveProperty("refreshtoken");

                    const Organizer: any = response.body;

                    const refreshToken = response.header.refreshtoken.split(" ")[1];
                    const cacheRefreshToken = await Cache.getRefreshToken(Organizer.id);

                    expect(Organizer).toBeTruthy();
                    expect(response.body).toMatchObject({ ...newValidOrganizerWithOutPassword });

                    expect(cacheRefreshToken).toBe(refreshToken);
                });

                it("Should be valid", async () => {
                    const response = await request(app).post(loginUrl(UserType.organizer)).send(ValidOrganizerLogin);
                    expect(response.header).toHaveProperty("refreshtoken");
                });



            });
        });

        describe("WHEN Organizer enters invalid inputs THEN Organizer does't login ", () => {

            it("should return 418", async () => request(app).post(loginUrl(UserType.organizer)).send({}).expect(418));

            it("Should return Validation error message", async () => {
                const response = await request(app).post(loginUrl(UserType.organizer)).send({});
                expect(response.body.error).toBeDefined();

                const error = response.body.error;
                expect(error).toBeTruthy();
                expect(error).toMatchObject({ msg: expect.any(String), type: "validation", attr: expect.any(String) });
            });

            it("Should return Invalid Email or Password error message", async () => {
                const response = await request(app).post(loginUrl(UserType.organizer)).send({ email: "abc1@gmail.com", password: "12345678" });
                expect(response.body.error).toBeDefined();

                const error = response.body.error;
                expect(error).toBeTruthy();
                expect(error).toMatchObject({ msg: "Invalid Email or Password", type: expect.any(String) });
            });

            it("Should not set Authentication header", async () => {
                const response = await request(app).post(loginUrl(UserType.organizer)).send({});
                expect(response.header).not.toHaveProperty("authorization");
            });

            it("should not set Refresh token", async () => {
                const response = await request(app).post(loginUrl(UserType.organizer)).send({});
                expect(response.header).not.toHaveProperty("refreshtoken");
            });

        });
    });

    describe("Refresh Token", () => {

        var Organizer: IOrganizer;
        var OrganizerRefreshToken: string;

        beforeEach(async () => {
            const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer);
            Organizer = response.body;
            OrganizerRefreshToken = response.header.refreshtoken.split(" ")[1];
        })

        describe("WHEN Organizer refresh a valid token THEN Organizer gets new accessToken and refreshToken", () => {

            it("Should return 200", async () => {
                const response = await request(app).get(refreshTokenUrl(UserType.organizer)).set('authorization', `Bearer ${OrganizerRefreshToken}`)
                expect((response).status).toBe(200);
            });

            it("Should have header AccessToken and Refreshtoken", async () => {

                const response = await request(app).get(refreshTokenUrl(UserType.organizer)).set('authorization', `Bearer ${OrganizerRefreshToken}`);
                expect(response.header).toHaveProperty("authorization");
                expect(response.header).toHaveProperty("refreshtoken");
            });

            it("Should have valid header AccessToken and Refreshtoken", async () => {

                const response = await request(app).get(refreshTokenUrl(UserType.organizer)).set('authorization', `Bearer ${OrganizerRefreshToken}`)

                expect(response.header).toHaveProperty("authorization");
                expect(response.header).toHaveProperty("refreshtoken");

                const accessToken = response.header.authorization.split(" ")[1];
                const refreshToken = response.header.refreshtoken.split(" ")[1];

                let Organizer = await verifyAccessToken(accessToken, UserType.organizer);
                expect(Organizer).toBeTruthy();
                Organizer = await verifyRefreshToken(refreshToken, UserType.organizer);
                expect(Organizer).toBeTruthy();

                OrganizerRefreshToken = refreshToken;

            });


            describe("WHEN Organizer refresh a valid token THEN token MUST be set on Cache", () => {

                it("Should exist on Cache ", async () => {
                    const response = await request(app).get(refreshTokenUrl(UserType.organizer)).set('authorization', `Bearer ${OrganizerRefreshToken}`);
                    const cacheRefreshToken = await Cache.getRefreshToken(Organizer.id);

                    expect(cacheRefreshToken).toBeTruthy();
                    expect(response.header).toHaveProperty("refreshtoken");

                    const newRefreshToken = response.header.refreshtoken.split(" ")[1];

                    expect(cacheRefreshToken).toBe(newRefreshToken);

                    OrganizerRefreshToken = newRefreshToken;
                });

                it("Should be in sync with Cache", async () => {
                    //TODO: compare old token with new token

                    const response = await request(app).get(refreshTokenUrl(UserType.organizer)).set('authorization', `Bearer ${OrganizerRefreshToken}`);
                    const cacheRefreshToken = await Cache.getRefreshToken(Organizer.id);
                    const newRefreshToken = response.header.refreshtoken.split(" ")[1];

                    expect(cacheRefreshToken).toBeTruthy();
                    expect(cacheRefreshToken).toBe(newRefreshToken);

                });
            })

        });

        describe("WHEN Organizer refresh an invalid token THEN Organizer gets 400", () => {

            it("should return 401", async () => request(app).get(refreshTokenUrl(UserType.organizer)).set('authorization', "").expect(400));

            it("Should Not change header AccessToken and Refreshtoken ", async () => {
                const response = await request(app).get(refreshTokenUrl(UserType.organizer)).set('authorization', `Bearer `);
                const cacheRefreshToken = await Cache.getRefreshToken(Organizer.id);

                expect(cacheRefreshToken).toBeTruthy();
                expect(response.header).not.toHaveProperty("authorization");
            })

        });

    });

    describe("Logout", () => {

        var Organizer: IOrganizer;
        var OrganizerAccessToken: string;

        beforeEach(async () => {

            const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer);
            Organizer = response.body;
            OrganizerAccessToken = response.header.authorization.split(" ")[1];
        })

        describe("WHEN a valid Organizer logout THEN Organizer token is remove", () => {


            it("Should return 200", async () => {
                const response = await request(app).delete(logoutUrl(UserType.organizer)).set('authorization', `Bearer ${OrganizerAccessToken}`)
                expect((response).status).toBe(200);
            });

            it("Should remove Refresh Token token from Cache", async () => {
                const response = await request(app).delete(logoutUrl(UserType.organizer)).set('authorization', `Bearer ${OrganizerAccessToken}`)
                const cacheRefreshToken = await Cache.getRefreshToken(Organizer.id);
                expect(cacheRefreshToken).toBeFalsy();
            });

        });

        describe("WHEN an invalid Organizer logout THEN Organizer token is NOT remove", () => {

            it("should return 401", async () => request(app).delete(logoutUrl(UserType.organizer)).set('authorization', "Bearer ").expect(401));

            it("Should only remove token from Cache if valid", async () => {
                await request(app).delete(logoutUrl(UserType.organizer)).set('authorization', `Bearer `)
                const cacheRefreshToken = await Cache.getRefreshToken(Organizer.id);
                expect(cacheRefreshToken).toBeTruthy();
            });

        })

    });

    describe("VerifyOrganizer", () => {
        var Organizer: IOrganizer;
        var accessToken: string;

        beforeEach(async () => {
            const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer);
            Organizer = response.body;
            accessToken = response.header.authorization.split(" ")[1];
        })

        describe("WHEN Organizer sign up for the first time THEY must not be verified", () => {
            it("Should be None", () => expect(Organizer.verified).toBe("none"));
        })

        describe("WHEN Organizer request to be verified WITH invalid request", () => {
            it("Should return 404 when invalid verification key ", () => request(app).patch(verifyUserUrl("abc", UserType.organizer)).set('authorization', `Bearer ${accessToken}`).expect(404));
            it("Should return 401 when invalid access Token", () => request(app).patch(verifyUserUrl("email", UserType.organizer)).set('authorization', `Bearer `).expect(401));

        });


        describe.each(
            VerifyOrganizerKeys.map((verifyBy) => ({
                testName: `WHEN Organizer verify with ${verifyBy} THEN Organizer is verified`,
                verifyBy
            }))
        )(`$testName`, ({ verifyBy }) => {

            it(`should be verified By ${verifyBy}`, async () => {
                const response = await request(app).patch(verifyUserUrl(verifyBy, UserType.organizer)).set('authorization', `Bearer ${accessToken}`);
                expect(response.body.verified).not.toBeNull();
                expect(response.body.verified).toBe(verifyBy);
            })
        });


    })

    describe("forgotPassword", () => {

        var Organizer: IOrganizer;
        var accessToken: string;
        const validValue: any = { email: newValidOrganizer.email, phone: newValidOrganizer.phone, both: newValidOrganizer.email }
        const validNewPassword = "abcd123451"

        beforeEach(async () => {

            const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer);
            Organizer = response.body;
            accessToken = response.header.authorization.split(" ")[1];
        })

        describe("WHEN Organizer request to reset password with invalid input", () => {

            it("Should return 404 if invalid key", () => request(app).patch(forgotPasswordUrl("abc", newValidOrganizer.email, newValidOrganizer.password, UserType.organizer)).expect(404));
            it("Should return 404 if invalid value", () => request(app).patch(forgotPasswordUrl("email", "invalid", newValidOrganizer.password, UserType.organizer)).expect(404));
            it("should return 404 if invalid new password", () => request(app).patch(forgotPasswordUrl("email", newValidOrganizer.email, "", UserType.organizer)).expect(404));
            // it("invalid old password should return 404", () => request(app).patch(forgotPasswordUrl("email", validValue.Email, validNewPassword, UserType)o.expect(404));
        })

        describe.each(
            VerifyOrganizerKeysSupported.map((resetBy, index, array) => ({
                testName: `WHEN Organizer reset password with ${resetBy} THEN But Organizer is verified By ${getAdjacentKey(array, resetBy)}`,
                resetBy,
                index,
                array
            })))(`$testName`, ({ resetBy, index, array }) => {

                beforeEach(async () => {
                    await request(app).patch(verifyUserUrl(resetBy, UserType.organizer)).set('authorization', `Bearer ${accessToken}`);
                });
                it("Should return 404", () => request(app).patch(forgotPasswordUrl(resetBy, validValue[getAdjacentKey(array, resetBy)], validNewPassword, UserType.organizer)).expect(404));
            });


        describe.each(
            [...VerifyOrganizerKeysSupported.map((resetBy) => ({
                testName: `WHEN Organizer reset password with ${resetBy} and Organizer is verified with ${resetBy} THEN Organizer password is reset`,
                resetBy,
                verifiedBy: resetBy
            })),
            ]
        )(`$testName`, ({ resetBy, verifiedBy }) => {

            beforeEach(async () => {
                await request(app).patch(verifyUserUrl(verifiedBy, UserType.organizer)).set('authorization', `Bearer ${accessToken}`);
            });

            it("Should return 200", async () => request(app).patch(forgotPasswordUrl(resetBy, validValue[resetBy], validNewPassword, UserType.organizer)).expect(200));

            it("Should logIn with New password", async () => {
                await request(app).patch(forgotPasswordUrl(resetBy, validValue[resetBy], validNewPassword, UserType.organizer))

                const response = await request(app).post(loginUrl(UserType.organizer)).send({ email: newValidOrganizer.email, password: validNewPassword });
                expect(response.body).toMatchObject({ ...newValidOrganizerWithOutPassword });
            });

            it("Should Not logIn with old password", async () => {
                await request(app).patch(forgotPasswordUrl(resetBy, validValue[resetBy], validNewPassword, UserType.organizer))
                const response = await request(app).post(loginUrl(UserType.organizer)).send({ email: newValidOrganizer.email, password: newValidOrganizer.password });
                const error = response.body.error;
                expect(error).toBeTruthy();
                expect(error).toMatchObject({ msg: 'Invalid Email or Password', type: 'Validation' });
            });

        });
    })

})
