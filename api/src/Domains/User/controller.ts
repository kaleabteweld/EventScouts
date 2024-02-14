import { IUserLogInFrom, IUserLogInFromWithWallet, IUserSignUpFrom } from "./types";
import { logInSchema, logInWithWalletSchema, newUserSchema, userChangePassword } from "./validation";
import { UserType } from "../../Types";
import { IChangePasswordFrom, IResponseType, IResponseWithHeaderType } from "../Common/types";
import { Route, Tags, Get, Patch, Post, Delete, Body, Query, Path } from "tsoa";
import User from "../../Schema/user.schema";
import { MakeTokens, MakeValidator, verifyAccessToken, verifyRefreshToken } from "../Common/utils";
import Cache from "../../Util/cache";
import { IUser, TVerified } from "../../Schema/Types/user.schema.types";

@Route("/user")
@Tags("User")
export default class UserController {


    @Path("/Authentication/user")
    @Tags("Auth")
    @Post("/SignUp")
    static async signUp(_user: IUserSignUpFrom): Promise<IResponseWithHeaderType<IUser>> {

        await User.validator(_user, newUserSchema)
        const user = await new User((_user as any));
        await user!.encryptPassword();
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

    @Path("/Authentication/user")
    @Tags("Auth")
    @Post("/logOut")
    static async logOut(token: string): Promise<void> {
        const user = await verifyAccessToken<IUser>(token, UserType.user);
        await Cache.run(() => Cache.removeRefreshToken(user.id));
    }

    @Path("/Authentication/user")
    @Tags("Auth")
    @Patch("/forgotPassword/{key}/{Value}/{newPassword}")
    static async forgotPassword(key: "email" | "phone", value: string, _newPassword: string): Promise<IResponseType<undefined>> {

        const { password } = await MakeValidator<IChangePasswordFrom>(userChangePassword, { password: _newPassword });

        const user = await User.getByVerifiedKey(key, value);
        await user!.encryptPassword(password);
        await user!.save();

        return { body: undefined }
    }

    @Patch("VerifyUser/{key}")
    static async verifyUser(_user: IUser, key: TVerified): Promise<IResponseType<IUser>> {
        const user = await User.getUserById(_user.id);
        await user!.applyUserVerify(key);

        return { body: user!.toJSON() }
    }

}
