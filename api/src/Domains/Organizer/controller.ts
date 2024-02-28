import { IOrganizerLogInFrom, IOrganizerSignUpFrom } from "./types";
import { organizerIogInSchema, OrganizerChangePassword, newOrganizerSchema } from "./validation";
import { UserType } from "../../Types";
import { IChangePasswordFrom, IResponseType, IResponseWithHeaderType } from "../Common/types";
import { Route, Tags, Get, Patch, Post, Delete, Body, Query, Path } from "tsoa";
import OrganizerModel from "../../Schema/organizer.schema";
import { MakeTokens, MakeValidator, verifyAccessToken, verifyRefreshToken } from "../Common/utils";
import Cache from "../../Util/cache";
import { IOrganizer, TVerified } from "../../Schema/Types/organizer.schema.types";

@Route("/organizer")
@Tags("organizer")
export default class OrganizerController {

    @Get("/")
    static async getById(organizer: IOrganizer): Promise<IResponseType<IOrganizer | null>> {
        return { body: ((await OrganizerModel.getById(organizer.id ?? "", "categorys"))?.toJSON() as any) };
    }

    @Path("/Authentication/organizer")
    @Tags("Auth")
    @Post("/SignUp")
    static async signUp(_organizer: IOrganizerSignUpFrom): Promise<IResponseWithHeaderType<IOrganizer>> {

        await OrganizerModel.validator(_organizer, newOrganizerSchema);
        const organizer = await new OrganizerModel((_organizer));
        await organizer!.encryptPassword();
        await organizer.save();
        const { accessToken, refreshToken } = await MakeTokens(organizer.toJSON(), UserType.organizer);

        return { body: (organizer.toJSON() as any), header: { accessToken, refreshToken } }
    }

    @Path("/Authentication/organizer")
    @Tags("Auth")
    @Post("/logIn")
    static async logIn(from: IOrganizerLogInFrom): Promise<IResponseWithHeaderType<IOrganizer>> {
        await OrganizerModel.validator(from, organizerIogInSchema);
        const organizer = await OrganizerModel.getByEmail(from.email);
        await organizer!.checkPassword(from.password);

        const { accessToken, refreshToken } = await MakeTokens(organizer!.toJSON(), UserType.organizer);
        return { body: (organizer!.toJSON() as any), header: { accessToken, refreshToken } }

    }


    @Path("/Authentication/organizer")
    @Tags("Auth")
    @Get("/refreshToken/{}")
    static async refreshToken(_refreshToken: string): Promise<IResponseWithHeaderType<undefined>> {

        const tokenUser = await verifyRefreshToken<IOrganizer>(_refreshToken, UserType.organizer);
        const organizer = await OrganizerModel.getById(tokenUser!.id);
        const { accessToken, refreshToken } = await MakeTokens(organizer!.toJSON(), UserType.organizer);

        return { body: undefined, header: { accessToken, refreshToken } }
    }

    @Path("/Authentication/organizer")
    @Tags("Auth")
    @Post("/logOut")
    static async logOut(token: string): Promise<void> {
        const organizer = await verifyAccessToken<IOrganizer>(token, UserType.organizer);
        await Cache.run(() => Cache.removeRefreshToken(organizer.id));
    }

    @Path("/Authentication/organizer")
    @Tags("Auth")
    @Patch("/forgotPassword/{key}/{Value}/{newPassword}")
    static async forgotPassword(key: "email" | "phone", value: string, _newPassword: string): Promise<IResponseType<undefined>> {

        const { password } = await MakeValidator<IChangePasswordFrom>(OrganizerChangePassword, { password: _newPassword });

        const organizer = await OrganizerModel.getByVerifiedKey(key, value);
        await organizer!.encryptPassword(password);
        await organizer!.save();

        return { body: undefined }
    }

    @Patch("VerifyUser/{key}")
    static async verifyUser(_organizer: IOrganizer, key: TVerified): Promise<IResponseType<IOrganizer>> {
        const organizer = await OrganizerModel.getById(_organizer.id);
        await organizer!.applyVerify(key);

        return { body: (organizer!.toJSON() as any) }
    }

}