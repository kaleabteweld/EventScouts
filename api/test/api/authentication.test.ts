import { IUserLogInFrom, IUserLogInFromWithWallet, IUserSignUpFrom } from "../../src/Domains/User/types";
import { UserType } from "../../src/Types";
import { makeServer } from "../../src/Util/Factories";
import Cache from "../../src/Util/cache";
import { connectDB, dropCollections, dropDB, testPasswordReset } from "./util";
import request from "supertest";
import { describe, expect, beforeEach, afterEach, beforeAll, afterAll, it } from '@jest/globals';
import { verifyAccessToken, verifyRefreshToken } from "../../src/Domains/Common/utils";
import { IUser } from "../../src/Schema/user.schema";

const app = makeServer();

const newValidUser: IUserSignUpFrom = {
    dateOfBirth: new Date(),
    email: "test@test.com",
    gender: 'Male',
    name: "test",
    password: "abcd12345",
    phone: "+251900000",
    userName: "test",
    walletAccounts: ["fdd3d4ad2a1c88bfa0e44e18bf4b04886d28dc7ecaa47a838b4f1dee8eb551afdd859c926ab9b8001bdc3fb758fd7253a56df6f61cb93d0178d063cf79e602f5", "07f153aae615da277f12fc6d891d143ece72cbb4d9c4d12170b6b7ac78d53f4acb177511c67cb95737247fd3edfc94d3b33bb49a7432dcc838ba7a8fed5e015b"]
};
const ValidUserLogin: IUserLogInFrom = {
    email: "test@test.com",
    password: "abcd12345",
};
function validUserLoginWithWalletFactory(WalletIndex: "1" | "2" | "both" | "none"): IUserLogInFromWithWallet {
    var temp = [];
    const walletAccounts = ["fdd3d4ad2a1c88bfa0e44e18bf4b04886d28dc7ecaa47a838b4f1dee8eb551afdd859c926ab9b8001bdc3fb758fd7253a56df6f61cb93d0178d063cf79e602f5", "07f153aae615da277f12fc6d891d143ece72cbb4d9c4d12170b6b7ac78d53f4acb177511c67cb95737247fd3edfc94d3b33bb49a7432dcc838ba7a8fed5e015b"]
    if (WalletIndex == "1") temp.push(walletAccounts[0])
    if (WalletIndex == "2") temp.push(walletAccounts[1])
    if (WalletIndex == "1") temp = [...walletAccounts]
    return {
        walletAccounts: temp
    }
}
const sighupUrl = (user: UserType) => `/Api/v1/public/authentication/${user}/signUp`;
const loginUrl = (user: UserType, wallet: boolean = false) => `/Api/v1/public/authentication/${user}/login${wallet ? "/wallet" : ""}`;
const refreshTokenUrl = (user: UserType) => `/Api/v1/public/authentication/${user}/refreshToken`;
const logoutUrl = (user: UserType) => `/Api/v1/private/authentication/${user}/logOut`;
const verifyUserUrl = (key: string, user: UserType) => `/Api/v1/private/${user}/VerifyUser/${key}`;
const forgotPasswordUrl = (key: string, value: string, newPassword: string, user: UserType) => `/Api/v1/public/authentication/${user}/forgotPassword/${key}/${value}/${newPassword}`;






describe('Authentication', () => {

    beforeAll(() => {
        return Promise.all([connectDB(), Cache.connect()]);
    });

    afterAll(() => {
        return Promise.all([dropDB(), Cache.disconnect()]);
    });

    afterEach(async () => {
        return await dropCollections();
    });

    describe('User Authentication', () => {

        describe("SignUp", () => {
            describe("WHEN user enters valid inputs THEN user sign up ", () => {

                it("Should return 200", async () => request(app).post(sighupUrl(UserType.user)).send(newValidUser).expect(200));

                it("Should return user obj", async () => {
                    const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                    const newUser = { ...newValidUser }
                    delete (newUser as any).password;
                    expect(response.body).toMatchObject({ ...newUser, dateOfBirth: expect.any(String) });

                });

                describe("Should be valid Access Token in header WHEN user enters valid inputs", () => {

                    it("Should be set", async () => {
                        const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                        expect(response.header).toHaveProperty("authorization");

                        const accessToken = response.header.authorization.split(" ")[1];
                        expect(accessToken).toBeTruthy();
                    });

                    it("Should be valid", async () => {
                        const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                        expect(response.header).toHaveProperty("authorization");

                        const accessToken = response.header.authorization.split(" ")[1];
                        const user = await verifyAccessToken(accessToken, UserType.user);
                        expect(user).toBeTruthy();
                        const newUser = { ...newValidUser }
                        delete (newUser as any).password;
                        expect(user).toMatchObject({ ...newUser, dateOfBirth: expect.any(String) });
                    });

                });

                describe("Should be valid Refresh token in header WHEN user enters valid inputs", () => {

                    it("Should be set", async () => {
                        const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                        expect(response.header).toHaveProperty("refreshtoken");

                        const refreshToken = response.header.refreshtoken.split(" ")[1];
                        expect(refreshToken).toBeTruthy();
                    });

                    it("Should be set in Cache", async () => {
                        const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                        expect(response.header).toHaveProperty("refreshtoken");

                        const user: any = response.body;

                        const refreshToken = response.header.refreshtoken.split(" ")[1];
                        const cacheRefreshToken = await Cache.getRefreshToken(user.id);

                        expect(user).toBeTruthy();
                        expect(cacheRefreshToken).toBe(refreshToken);
                    });

                    it("Should be valid", async () => {
                        const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                        expect(response.header).toHaveProperty("refreshtoken");

                        const refreshToken = response.header.refreshtoken.split(" ")[1];
                        const user = await verifyRefreshToken(refreshToken, UserType.user);

                        expect(user).toBeTruthy();
                        const newUser = { ...newValidUser }
                        delete (newUser as any).password;
                        expect(user).toMatchObject({ ...newUser, dateOfBirth: expect.any(String) });
                    });

                });
            })

            describe("WHEN user enters invalid inputs THEN user Dose NOT sign up ", () => {

                it("should return 418", async () => request(app).post(sighupUrl(UserType.user)).send({}).expect(418));

                it("should return Validation error message", async () => {
                    const response = await request(app).post(sighupUrl(UserType.user)).send({});
                    console.log({ body: response.body })
                    expect(response.body.error).toBeDefined();

                    const error = response.body.error;
                    expect(error).toBeTruthy();
                    expect(error).toMatchObject({ msg: expect.any(String), type: "validation", attr: expect.any(String) });
                });

                it("should not set Authentication header", async () => {
                    const response = await request(app).post(sighupUrl(UserType.user)).send({});
                    expect(response.header).not.toHaveProperty("authorization");
                });

                it("should not set Refresh token", async () => {
                    const response = await request(app).post(sighupUrl(UserType.user)).send({});
                    expect(response.header).not.toHaveProperty("refreshtoken");
                });

            });
        })

        describe("Login", () => {

            beforeEach(() => {
                return request(app).post(sighupUrl(UserType.user)).send(newValidUser)
            });

            describe("WHEN user enters valid inputs THEN user login ", () => {

                it("Should return 200", async () => request(app).post(loginUrl(UserType.user)).send(ValidUserLogin).expect(200));

                it("Should return user obj", async () => {
                    const response = await request(app).post(loginUrl(UserType.user)).send(ValidUserLogin);

                    const newUser = { ...newValidUser }
                    delete (newUser as any).password;
                    expect(response.body).toMatchObject({ ...newUser, dateOfBirth: expect.any(String) });
                });

                describe("WHEN user enters valid inputs THEN Authentication header is set", () => {

                    it("Should be set", async () => {
                        const response = await request(app).post(loginUrl(UserType.user)).send(ValidUserLogin);
                        expect(response.header).toHaveProperty("authorization");

                        const accessToken = response.header.authorization.split(" ")[1];
                        expect(accessToken).toBeTruthy();
                    });

                    it("Should be valid", async () => {
                        const response = await request(app).post(loginUrl(UserType.user)).send(ValidUserLogin);
                        expect(response.header).toHaveProperty("authorization");

                        const accessToken = response.header.authorization.split(" ")[1];
                        const user = await verifyAccessToken(accessToken, UserType.user);
                        expect(user).toBeTruthy();

                        const newUser = { ...newValidUser }
                        delete (newUser as any).password;
                        expect(response.body).toMatchObject({ ...newUser, dateOfBirth: expect.any(String) });
                    });

                });

                describe("WHEN user enters valid inputs THEN Refresh token is set", () => {

                    it("Should be set", async () => {
                        const response = await request(app).post(loginUrl(UserType.user)).send(ValidUserLogin);
                        expect(response.header).toHaveProperty("refreshtoken");

                        const refreshToken = response.header.refreshtoken.split(" ")[1];
                        expect(refreshToken).toBeTruthy();
                    });

                    it("Should be set in Cache", async () => {
                        const response = await request(app).post(loginUrl(UserType.user)).send(ValidUserLogin);
                        expect(response.header).toHaveProperty("refreshtoken");

                        const user: any = response.body;

                        const refreshToken = response.header.refreshtoken.split(" ")[1];
                        const cacheRefreshToken = await Cache.getRefreshToken(user.id);

                        expect(user).toBeTruthy();

                        const newUser = { ...newValidUser }
                        delete (newUser as any).password;
                        expect(response.body).toMatchObject({ ...newUser, dateOfBirth: expect.any(String) });

                        expect(cacheRefreshToken).toBe(refreshToken);
                    });

                    it("Should be valid", async () => {
                        const response = await request(app).post(loginUrl(UserType.user)).send(ValidUserLogin);
                        expect(response.header).toHaveProperty("refreshtoken");
                    });



                });
            });

            describe("WHEN user enters invalid inputs THEN user login ", () => {

                it("should return 418", async () => request(app).post(loginUrl(UserType.user)).send({}).expect(418));

                it("Should return Validation error message", async () => {
                    const response = await request(app).post(loginUrl(UserType.user)).send({});
                    expect(response.body.error).toBeDefined();

                    const error = response.body.error;
                    expect(error).toBeTruthy();
                    expect(error).toMatchObject({ msg: expect.any(String), type: "validation", attr: expect.any(String) });
                });

                it("Should return Invalid Email or Password error message", async () => {
                    const response = await request(app).post(loginUrl(UserType.user)).send({ email: "abc1@gmail.com", password: "12345678" });
                    expect(response.body.error).toBeDefined();

                    const error = response.body.error;
                    expect(error).toBeTruthy();
                    expect(error).toMatchObject({ msg: "Invalid Email or Password", type: expect.any(String) });
                });

                it("Should not set Authentication header", async () => {
                    const response = await request(app).post(loginUrl(UserType.user)).send({});
                    expect(response.header).not.toHaveProperty("authorization");
                });

                it("should not set Refresh token", async () => {
                    const response = await request(app).post(loginUrl(UserType.user)).send({});
                    expect(response.header).not.toHaveProperty("refreshtoken");
                });

            });
        });

        describe("Login With Wallet Address", () => {

            beforeEach(() => {
                return request(app).post(sighupUrl(UserType.user)).send(newValidUser)
            });

            describe("WHEN user enters valid inputs THEN user login ", () => {

                it.each(
                    ["fdd3d4ad2a1c88bfa0e44e18bf4b04886d28dc7ecaa47a838b4f1dee8eb551afdd859c926ab9b8001bdc3fb758fd7253a56df6f61cb93d0178d063cf79e602f5",
                        "07f153aae615da277f12fc6d891d143ece72cbb4d9c4d12170b6b7ac78d53f4acb177511c67cb95737247fd3edfc94d3b33bb49a7432dcc838ba7a8fed5e015b"]
                )("Should LogIn with any Wallet", async (wallet) => request(app).post(loginUrl(UserType.user, true)).send({
                    walletAccounts: [wallet]
                }).expect(200));

                it.each(
                    ["fdd3d4ad2a1c88bfa0e44e18bf4b04886d28dc7ecaa47a838b4f1dee8eb551afdd859c926ab9b8001bdc3fb758fd7253a56df6f61cb93d0178d063cf79e602f5",
                        "07f153aae615da277f12fc6d891d143ece72cbb4d9c4d12170b6b7ac78d53f4acb177511c67cb95737247fd3edfc94d3b33bb49a7432dcc838ba7a8fed5e015b"]
                )("Should return user obj", async (wallet) => {
                    const response = await request(app).post(loginUrl(UserType.user, true)).send({
                        walletAccounts: [wallet]
                    });

                    const newUser = { ...newValidUser }
                    delete (newUser as any).password;
                    expect(response.body).toMatchObject({ ...newUser, dateOfBirth: expect.any(String) });
                });

            });

            describe("WHEN user enters invalid inputs THEN user login ", () => {

                it("should return 418", async () => request(app).post(loginUrl(UserType.user, true)).send({}).expect(418));

                it("Should return Validation error message", async () => {
                    const response = await request(app).post(loginUrl(UserType.user, true)).send({});
                    expect(response.body.error).toBeDefined();

                    const error = response.body.error;
                    expect(error).toBeTruthy();
                    expect(error).toMatchObject({ msg: expect.any(String), type: "validation", attr: expect.any(String) });
                });

                it("Should return Invalid Wallet Address error message", async () => {
                    const response = await request(app).post(loginUrl(UserType.user, true)).send({ walletAccounts: ["86d28dc7ecaa47a838b4f1dee8eb551afdd859c926ab9b8001bdc3fb758d143ece72cbb4d9c4d12170b6b7ac78d53f4acb177511c67cb9573"] });
                    expect(response.body.error).toBeDefined();

                    const error = response.body.error;
                    expect(error).toBeTruthy();
                    expect(error).toMatchObject({ msg: "Invalid Wallet Address", type: expect.any(String) });
                });

                it("Should not set Authentication header", async () => {
                    const response = await request(app).post(loginUrl(UserType.user)).send({});
                    expect(response.header).not.toHaveProperty("authorization");
                });

                it("should not set Refresh token", async () => {
                    const response = await request(app).post(loginUrl(UserType.user)).send({});
                    expect(response.header).not.toHaveProperty("refreshtoken");
                });

            });


        });

        describe("Refresh Token", () => {

            var user: IUser;
            var userRefreshToken: string;

            beforeEach(async () => {
                const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                user = response.body;
                userRefreshToken = response.header.refreshtoken.split(" ")[1];
            })

            describe("WHEN user refresh a valid token THEN user gets new accessToken and refreshToken", () => {

                it("Should return 200", async () => {
                    const response = await request(app).get(refreshTokenUrl(UserType.user)).set('authorization', `Bearer ${userRefreshToken}`)
                    expect((response).status).toBe(200);
                });

                it("Should have header AccessToken and Refreshtoken", async () => {

                    const response = await request(app).get(refreshTokenUrl(UserType.user)).set('authorization', `Bearer ${userRefreshToken}`);
                    expect(response.header).toHaveProperty("authorization");
                    expect(response.header).toHaveProperty("refreshtoken");
                });

                it("Should have valid header AccessToken and Refreshtoken", async () => {

                    const response = await request(app).get(refreshTokenUrl(UserType.user)).set('authorization', `Bearer ${userRefreshToken}`)

                    expect(response.header).toHaveProperty("authorization");
                    expect(response.header).toHaveProperty("refreshtoken");

                    const accessToken = response.header.authorization.split(" ")[1];
                    const refreshToken = response.header.refreshtoken.split(" ")[1];

                    let user = await verifyAccessToken(accessToken, UserType.user);
                    expect(user).toBeTruthy();
                    user = await verifyRefreshToken(refreshToken, UserType.user);
                    expect(user).toBeTruthy();

                    userRefreshToken = refreshToken;

                });


                describe("WHEN user refresh a valid token THEN token MUST be set on Cache", () => {

                    it("Should exist on Cache ", async () => {
                        const response = await request(app).get(refreshTokenUrl(UserType.user)).set('authorization', `Bearer ${userRefreshToken}`);
                        const cacheRefreshToken = await Cache.getRefreshToken(user.id);

                        expect(cacheRefreshToken).toBeTruthy();
                        expect(response.header).toHaveProperty("refreshtoken");

                        const newRefreshToken = response.header.refreshtoken.split(" ")[1];

                        expect(cacheRefreshToken).toBe(newRefreshToken);

                        userRefreshToken = newRefreshToken;
                    });

                    it("Should be in sync with Cache", async () => {
                        //TODO: compare old token with new token

                        const response = await request(app).get(refreshTokenUrl(UserType.user)).set('authorization', `Bearer ${userRefreshToken}`);
                        const cacheRefreshToken = await Cache.getRefreshToken(user.id);
                        const newRefreshToken = response.header.refreshtoken.split(" ")[1];

                        expect(cacheRefreshToken).toBeTruthy();
                        expect(cacheRefreshToken).toBe(newRefreshToken);

                    });
                })

            });

            describe("WHEN user refresh an invalid token THEN user gets 400", () => {

                it("should return 401", async () => request(app).get(refreshTokenUrl(UserType.user)).set('authorization', "").expect(400));

                it("Should Not change header AccessToken and Refreshtoken ", async () => {
                    const response = await request(app).get(refreshTokenUrl(UserType.user)).set('authorization', `Bearer `);
                    const cacheRefreshToken = await Cache.getRefreshToken(user.id);

                    expect(cacheRefreshToken).toBeTruthy();
                    expect(response.header).not.toHaveProperty("authorization");
                })

            });

        });

        describe("Logout", () => {

            var user: IUser;
            var userAccessToken: string;

            beforeEach(async () => {

                const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                user = response.body;
                userAccessToken = response.header.authorization.split(" ")[1];
            })

            describe("WHEN a valid user logout THEN user token is remove", () => {


                it("Should return 200", async () => {
                    const response = await request(app).delete(logoutUrl(UserType.user)).set('authorization', `Bearer ${userAccessToken}`)
                    expect((response).status).toBe(200);
                });

                it("Should remove Refresh Token token from Cache", async () => {
                    const response = await request(app).delete(logoutUrl(UserType.user)).set('authorization', `Bearer ${userAccessToken}`)
                    const cacheRefreshToken = await Cache.getRefreshToken(user.id);
                    expect(cacheRefreshToken).toBeFalsy();
                });

            });

            describe("WHEN an invalid user logout THEN user token is NOT remove", () => {

                it("should return 401", async () => request(app).delete(logoutUrl(UserType.user)).set('authorization', "Bearer ").expect(401));

                it("Should only remove token from Cache if valid", async () => {
                    const response = await request(app).delete(logoutUrl(UserType.user)).set('authorization', `Bearer `)
                    const cacheRefreshToken = await Cache.getRefreshToken(user.id);
                    expect(cacheRefreshToken).toBeTruthy();
                });

            })

        });

        describe("VerifyUser", () => {
            var user: IUser;
            var accessToken: string;

            beforeEach(async () => {
                const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                user = response.body;
                accessToken = response.header.authorization.split(" ")[1];
            })

            describe("WHEN user sign up for the first time THEY must not be verified", () => {
                it("Should be null", () => expect(user.verified).toBe("none"));
            })

            describe("WHEN user request to be verified WITH invalid request", () => {
                it("Should return 404 when invalid verification key ", () => request(app).patch(verifyUserUrl("abc", UserType.user)).set('authorization', `Bearer ${accessToken}`).expect(404));
                it("Should return 401 when invalid access Token", () => request(app).patch(verifyUserUrl("email", UserType.user)).set('authorization', `Bearer `).expect(401));

            });


            describe.each(
                Object.values(['email', 'phone', 'Both']).map((verifyBy) => ({
                    testName: `WHEN user verify with ${verifyBy} THEN user is verified`,
                    verifyBy
                }))
            )(`$testName`, ({ verifyBy }) => {

                it(`should be By ${verifyBy}`, async () => {
                    const response = await request(app).patch(verifyUserUrl(verifyBy, UserType.user)).set('authorization', `Bearer ${accessToken}`);
                    expect(response.body.verified).not.toBeNull();
                    expect(response.body.verified).toBe(verifyBy);
                })
            });


        })

        describe("forgotPassword", () => {

            var user: IUser;
            var accessToken: string;
            const validValue: any = { email: newValidUser.email, phone: newValidUser.phone }
            const validNewPassword = "abcd123451"

            beforeEach(async () => {

                const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                user = response.body;
                accessToken = response.header.authorization.split(" ")[1];
            })

            describe("WHEN user request to reset password with invalid input", () => {

                it("Should return 404 if invalid key", () => request(app).patch(forgotPasswordUrl("abc", newValidUser.email, newValidUser.password, UserType.user)).expect(404));
                it("Should return 404 if invalid value", () => request(app).patch(forgotPasswordUrl("email", "invalid", newValidUser.password, UserType.user)).expect(404));
                it("should return 404 if invalid new password", () => request(app).patch(forgotPasswordUrl("email", newValidUser.email, "", UserType.user)).expect(404));
                // it("invalid old password should return 404", () => request(app).patch(forgotPasswordUrl("email", validValue.Email, validNewPassword, userType)).expect(404));
            })

            describe.each(
                ['email', 'phone'].map((resetBy, index, array) => ({
                    testName: `WHEN user reset password with ${resetBy} THEN But user is verified By ${array[array.length - 1 > (index + 1) ? array.length - 1 : 0]}`,
                    resetBy,
                    index,
                    array
                })))(`$testName`, ({ resetBy, index, array }) => {

                    beforeEach(async () => {
                        await request(app).patch(verifyUserUrl(resetBy, UserType.user)).set('authorization', `Bearer ${accessToken}`);
                    });
                    it("Should return 404", () => request(app).patch(forgotPasswordUrl(array[array.length - 1 > (index + 1) ? array.length - 1 : 0], validValue[resetBy[array.length - 1 > (index + 1) ? array.length - 1 : 0]], validNewPassword, UserType.user)).expect(404));
                });


            describe.each(
                [...['email', 'phone'].map((resetBy) => ({
                    testName: `WHEN user reset password with ${resetBy} and user is verified with ${resetBy} THEN user password is reset`,
                    resetBy,
                    verifiedBy: resetBy
                })),
                ]
            )(`$testName`, ({ resetBy, verifiedBy }) => {

                console.log({ resetBy, verifiedBy })

                beforeEach(async () => {
                    await request(app).patch(verifyUserUrl(verifiedBy, UserType.user)).set('authorization', `Bearer ${accessToken}`);
                });

                it("should return 200", async () => request(app).patch(forgotPasswordUrl(resetBy, validValue[resetBy], validNewPassword, UserType.user)).expect(200));

                it("should logIn with New password", async () => {
                    await request(app).patch(forgotPasswordUrl(resetBy, validValue[resetBy], validNewPassword, UserType.user))

                    const response = await request(app).post(loginUrl(UserType.user)).send({ email: newValidUser.email, password: validNewPassword });
                    const newUser = { ...newValidUser }
                    delete (newUser as any).password;
                    expect(response.body).toMatchObject({ ...newUser, dateOfBirth: expect.any(String) });
                });

                it("should Not logIn with old password", async () => {
                    await request(app).patch(forgotPasswordUrl(resetBy, validValue[resetBy], validNewPassword, UserType.user))
                    const response = await request(app).post(loginUrl(UserType.user)).send({ email: newValidUser.email, password: newValidUser.password });
                    const error = response.body.error;
                    expect(error).toBeTruthy();
                    expect(error).toMatchObject({ msg: 'Invalid Email or Password', type: 'Validation' });
                });

            });
        })

    })
})