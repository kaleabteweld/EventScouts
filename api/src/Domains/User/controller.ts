import { IUserLogInFrom, IUserLogInFromWithWallet, IUserSignUpFrom } from "./types";
import { logInSchema, logInWithWalletSchema, newUserSchema, userChangePassword } from "./validation";
import { UserType } from "../../Types";
import commonAuthenticationController from "../Common/authentication";
import { IChangePasswordFrom, IResponseType, IResponseWithHeaderType } from "../Common/types";
import { Route, Tags, Get, Patch, Post, Delete, Body, Query, Path } from "tsoa";
import User, { IUser } from "../../Schema/user.schema";
import { MakeTokens, verifyRefreshToken } from "../Common/utils";

@Route("/user")
@Tags("User")
export default class UserController {


    @Path("/Authentication/user")
    @Tags("Auth")
    @Post("/SignUp")
    static async signUp(_user: IUserSignUpFrom): Promise<IResponseWithHeaderType<IUser>> {

        await User.validator(_user, newUserSchema)
        const user = await new User((_user as any));
        await user.save();
        const { accessToken, refreshToken } = await MakeTokens(user.toJSON(), UserType.user);

        return { body: user.toJSON(), header: { accessToken, refreshToken } }
    }

    @Path("/Authentication/user")
    @Tags("Auth")
    @Post("/logIn")
    static async logIn(from: IUserLogInFrom): Promise<IResponseWithHeaderType<IUser>> {
        await User.validator(from, logInSchema);
        const user = await User.getUserByEmail(from.email);
        await user!.checkPassword(from.password);

        const { accessToken, refreshToken } = await MakeTokens(user!.toJSON(), UserType.user);
        return { body: user!.toJSON(), header: { accessToken, refreshToken } }

    }

    @Path("/Authentication/user")
    @Tags("Auth")
    @Post("/logIn/wallet")
    static async logInWithWallet(from: IUserLogInFromWithWallet): Promise<IResponseWithHeaderType<IUser>> {
        await User.validator(from, logInWithWalletSchema);
        const user = await User.getUserByWalletAccounts(from.walletAccounts);

        const { accessToken, refreshToken } = await MakeTokens(user!.toJSON(), UserType.user);
        return { body: user!.toJSON(), header: { accessToken, refreshToken } }

    }

    @Path("/Authentication/user")
    @Tags("Auth")
    @Get("/refreshToken/{}")
    static async refreshToken(_refreshToken: string): Promise<IResponseWithHeaderType<undefined>> {

        const tokenUser = await verifyRefreshToken<IUser>(_refreshToken, UserType.user);
        const user = await User.getUserById(tokenUser!.id);
        const { accessToken, refreshToken } = await MakeTokens(user!.toJSON(), UserType.user);

        return { body: undefined, header: { accessToken, refreshToken } }
    }

    // @Path("/Authentication/user")
    // @Tags("Auth")
    // @Post("/logOut")
    // static async logOut(@Query() token: string): Promise<void> {
    //     return await commonAuthenticationController.logOut<User>(token, {
    //         userType: UserType.user,
    //     })
    // }

    // @Path("/Authentication/user")
    // @Tags("Auth")
    // @Patch("/forgotPassword/{key}/{Value}/{newPassword}")
    // static async forgotPassword(key: string, Value: string, newPassword: string): Promise<any> {
    //     return await commonAuthenticationController.forgotPassword<User, IChangePasswordFrom, UserVerified>(key, Value, newPassword, {
    //         validator: userChangePassword,
    //         prismaClient: UserController.domainPrisma,
    //         checkVerifiedBy: userCheckVerifiedBy

    //     })
    // }

    // @Patch("VerifyUser/{key}")
    // static async verifyUser(@Body() user: User, key: string) {
    //     return await CommonController.verifyUser<User, UserVerified>(user, key, {
    //         prismaClient: UserController.domainPrisma
    //     })
    // }

    // @Get("/boughtTickets/{offset}/{amount}")
    // static async getBoughtTickets(offset?: number, amount?: number, @Query() userId?: string, @Query() ticketDetailID?: string) {


    //     return CommonController.getAll<Prisma.UserWhereInput, Prisma.UserInclude, any>({

    //         boughtTransaction: {
    //             some: {
    //                 boughtByUserID: {
    //                     equals: userId
    //                 },
    //             }
    //         }
    //     }, {
    //         prismaClient: UserController.domainPrisma,
    //         pagination: { offset, amount },
    //         include: {
    //             boughtTransaction: true
    //         }
    //     })
    // };

    // static async getUserBoughtTicketsByticketDetailID(ticketDetailID: string, userId?: string,) {
    //     return CommonController.getAll<Prisma.UserWhereInput, Prisma.UserInclude, any>({
    //         AND: [
    //             { id: userId },
    //             {
    //                 boughtTransaction: {
    //                     some: {
    //                         AND: [
    //                             { ticketDetail: { id: ticketDetailID } },
    //                             { boughtByUserID: userId },
    //                             { transactionStatus: TransactionStatus.Active }]
    //                     }
    //                 }
    //             }
    //         ]
    //     }, {
    //         prismaClient: UserController.domainPrisma,
    //         pagination: { offset: 0, amount: 1 },
    //         include: {
    //             boughtTransaction: true
    //         }
    //     },
    //     )
    // };

    // static async removeById(id: string) {
    //     return CommonController.removeByAttr<Prisma.UserWhereUniqueInput>({ id }, {
    //         prismaClient: UserController.domainPrisma
    //     })
    // }

    // static async getByAttr(attr: Prisma.UserWhereUniqueInput) {
    //     return CommonController.getByAttr<Prisma.UserWhereUniqueInput, Prisma.UserInclude>(attr, {
    //         prismaClient: UserController.domainPrisma
    //     })
    // }

}
