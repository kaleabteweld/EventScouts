import { IOrganizerLogInFrom, IOrganizerLogInFromWithWallet, IOrganizerSignUpFrom, IOrganizerUpdateFrom } from "./types";
import { organizerIogInSchema, OrganizerChangePassword, newOrganizerSchema, logInWithWalletSchema, updateOrganizerSchema } from "./validation";
import { UserType } from "../../Types";
import { IChangePasswordFrom, IResponseType, IResponseWithHeaderType } from "../Common/types";
import OrganizerModel from "../../Schema/organizer.schema";
import { MakeTokens, MakeValidator, verifyAccessToken, verifyRefreshToken } from "../Common/utils";
import Cache from "../../Util/cache";
import { IOrganizer, TVerified } from "../../Schema/Types/organizer.schema.types";
import { IUser } from "../../Schema/Types/user.schema.types";
import User from "../../Schema/user.schema";

export default class OrganizerController {

    static async getById(organizer: IOrganizer): Promise<IResponseType<IOrganizer | null>> {
        return { body: ((await OrganizerModel.getById(organizer.id ?? "", "categorys"))?.toJSON() as any) };
    }

    static async signUp(_organizer: IOrganizerSignUpFrom): Promise<IResponseWithHeaderType<IOrganizer>> {

        await OrganizerModel.validator(_organizer, newOrganizerSchema);
        const organizer = await new OrganizerModel((_organizer));
        await organizer!.encryptPassword();
        await organizer.save();
        const { accessToken, refreshToken } = await MakeTokens(organizer.toJSON(), UserType.organizer);

        return { body: (organizer.toJSON() as any), header: { accessToken, refreshToken } }
    }

    static async logIn(from: IOrganizerLogInFrom): Promise<IResponseWithHeaderType<IOrganizer>> {
        await OrganizerModel.validator(from, organizerIogInSchema);
        const organizer = await OrganizerModel.getByEmail(from.email);
        await organizer!.checkPassword(from.password);

        const { accessToken, refreshToken } = await MakeTokens(organizer!.toJSON(), UserType.organizer);
        return { body: (organizer!.toJSON() as any), header: { accessToken, refreshToken } }

    }

    static async refreshToken(_refreshToken: string): Promise<IResponseWithHeaderType<undefined>> {

        const tokenUser = await verifyRefreshToken<IOrganizer>(_refreshToken, UserType.organizer);
        const organizer = await OrganizerModel.getById(tokenUser!.id);
        const { accessToken, refreshToken } = await MakeTokens(organizer!.toJSON(), UserType.organizer);

        return { body: undefined, header: { accessToken, refreshToken } }
    }

    static async logOut(token: string): Promise<void> {
        const organizer = await verifyAccessToken<IOrganizer>(token, UserType.organizer);
        await Cache.run(() => Cache.removeRefreshToken(organizer.id));
    }

    static async forgotPassword(key: "email" | "phone", value: string, _newPassword: string): Promise<IResponseType<undefined>> {

        const { password } = await MakeValidator<IChangePasswordFrom>(OrganizerChangePassword, { password: _newPassword });

        const organizer = await OrganizerModel.getByVerifiedKey(key, value);
        await organizer!.encryptPassword(password);
        await organizer!.save();

        return { body: undefined }
    }

    static async verifyUser(_organizer: IOrganizer, key: TVerified): Promise<IResponseType<IOrganizer>> {
        const organizer = await OrganizerModel.getById(_organizer.id);
        await organizer!.applyVerify(key);

        return { body: (organizer!.toJSON() as any) }
    }

    static async logInWithWallet(from: IOrganizerLogInFromWithWallet): Promise<IResponseWithHeaderType<IOrganizer>> {
        await OrganizerModel.validator(from, logInWithWalletSchema);
        const organizer = await OrganizerModel.getByWalletAccounts(from.walletAccounts);

        const { accessToken, refreshToken } = await MakeTokens(organizer!.toJSON(), UserType.organizer);
        return { body: organizer!.toJSON(), header: { accessToken, refreshToken } }

    }

    static async connectWallet(_organizer: IOrganizer, wallet: string): Promise<IResponseType<IOrganizer>> {
        const organizer = await OrganizerModel.getById(_organizer.id);
        await organizer!.addWalletAccount(wallet);
        return { body: (organizer!.toJSON() as any) }
    }

    static async disconnectWallet(_organizer: IOrganizer, wallet: string): Promise<IResponseType<IOrganizer>> {
        const organizer = await OrganizerModel.getById(_organizer.id);
        await organizer!.removeWalletAccount(wallet);
        return { body: (organizer!.toJSON() as any) }
    }

    static async update(_from: IOrganizerUpdateFrom, _organizer: IOrganizer): Promise<IResponseType<IOrganizer>> {

        await OrganizerModel.validator(_from, updateOrganizerSchema);
        const organizer = await OrganizerModel.update(_organizer.id, _from);
        return { body: (organizer!.toJSON() as any) }
    }

    static async toggleFollower(organizerId: string, _user: IUser): Promise<IResponseType<IOrganizer>> {
        const organizer = await OrganizerModel.getById(organizerId);
        const user = await User.getUserById(_user.id);

        return { body: (await (await (organizer?.toggleFollower(user!)!)).toJSON() as any) }

    }
}