import express, { Request, Response } from "express";
import { MakeErrorHandler } from "../../Util/middlewares";
import UserController from "./controller";
import { IUser } from "../../Schema/Types/user.schema.types";


const publicUserRouter = express.Router();
const privateUserRouter = express.Router();

privateUserRouter.patch("/VerifyUser/:key", MakeErrorHandler(
    async (req: any, res: Response) => {

        const _user: IUser = req['user'];
        const key = req.params.key
        const user = await UserController.verifyUser(_user, key);
        res.json(user.body);
    }
));


publicUserRouter.use("/user", publicUserRouter);
privateUserRouter.use("/user", privateUserRouter);


export { publicUserRouter, privateUserRouter } 