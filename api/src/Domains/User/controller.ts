import { IUserLogInFrom, IUserLogInFromWithWallet, IUserSignUpFrom, IUserUpdateFrom } from "./types";
import { logInSchema, logInWithWalletSchema, newUserSchema, updateUserSchema, userChangePassword } from "./validation";
import { UserType } from "../../Types";
import { IChangePasswordFrom, IPagination, IResponseType, IResponseWithHeaderType } from "../Common/types";
import User from "../../Schema/user.schema";
import { MakeTokens, MakeValidator, verifyAccessToken, verifyRefreshToken } from "../Common/utils";
import Cache from "../../Util/cache";
import { IUser, TVerified } from "../../Schema/Types/user.schema.types";
import { ITransactions } from "../../Schema/Types/transactions.schema.types";
import { IOrganizer } from "../../Schema/Types/organizer.schema.types";


export default class UserController {

    static async signUp(_user: IUserSignUpFrom): Promise<IResponseWithHeaderType<IUser>> {

        await User.validator(_user, newUserSchema)
        const user = await new User((_user as any));
        await user!.encryptPassword();
        await user.save();
        const { accessToken, refreshToken } = await MakeTokens(user.toJSON(), UserType.user);

        return { body: user.toJSON(), header: { accessToken, refreshToken } }
    }

    static async logIn(from: IUserLogInFrom): Promise<IResponseWithHeaderType<IUser>> {
        await User.validator(from, logInSchema);
        const user = await User.getUserByEmail(from.email);
        await user!.checkPassword(from.password);

        const { accessToken, refreshToken } = await MakeTokens(user!.toJSON(), UserType.user);
        return { body: user!.toJSON(), header: { accessToken, refreshToken } }

    }

    static async logInWithWallet(from: IUserLogInFromWithWallet): Promise<IResponseWithHeaderType<IUser>> {
        await User.validator(from, logInWithWalletSchema);
        const user = await User.getUserByWalletAccounts(from.walletAccounts);

        const { accessToken, refreshToken } = await MakeTokens(user!.toJSON(), UserType.user);
        return { body: user!.toJSON(), header: { accessToken, refreshToken } }

    }

    static async refreshToken(_refreshToken: string): Promise<IResponseWithHeaderType<undefined>> {

        const tokenUser = await verifyRefreshToken<IUser>(_refreshToken, UserType.user);
        const user = await User.getUserById(tokenUser!.id);
        const { accessToken, refreshToken } = await MakeTokens(user!.toJSON(), UserType.user);

        return { body: undefined, header: { accessToken, refreshToken } }
    }

    static async logOut(token: string): Promise<void> {
        const user = await verifyAccessToken<IUser>(token, UserType.user);
        await Cache.run(() => Cache.removeRefreshToken(user.id));
    }

    static async forgotPassword(key: "email" | "phone", value: string, _newPassword: string): Promise<IResponseType<undefined>> {

        const { password } = await MakeValidator<IChangePasswordFrom>(userChangePassword, { password: _newPassword });

        const user = await User.getByVerifiedKey(key, value);
        await user!.encryptPassword(password);
        await user!.save();

        return { body: undefined }
    }

    static async verifyUser(_user: IUser, key: TVerified): Promise<IResponseType<IUser>> {
        const user = await User.getUserById(_user.id);
        await user!.applyUserVerify(key);

        return { body: user!.toJSON() }
    }

    static async update(_user: IUserUpdateFrom, userId: string): Promise<IResponseType<IUser | null>> {

        await User.validator(_user, updateUserSchema)
        const user = await User.getUserById(userId);

        const updateUser = await User.update(userId, _user)

        return { body: (updateUser as any).toJSON() }
    }

    static async getById(user: IUser): Promise<IResponseType<IUser | null>> {
        return { body: ((await User.getUserById(user.id ?? ""))?.toJSON() as any) };
    }

    static async removeById(userId: string, user: IUser): Promise<IResponseType<{} | null>> {
        const event = await User.getUserById(userId);
        await User.removeByID(event?.id)

        return { body: {} };

    }

    static async getUserTransactions(userId: string, pagination: IPagination): Promise<IResponseType<ITransactions[]>> {
        const transactions = await User.getTransactions(userId, pagination);
        return { body: transactions }
    }
}
