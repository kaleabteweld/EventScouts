import express, { Request, Response } from "express";
import { errorFactory } from "../../Util/Factories";
import { MakeErrorHandler } from "../../Util/middlewares";
import UserController from "./controller";
import { IUser } from "../../Schema/user.schema";


const publicUserRouter = express.Router();
const privateUserRouter = express.Router();

// privateUserRouter.all("/\/user/", MakeErrorHandler(
//     async (req: any, res: Response, next: any) => {

//         const _user: User = req['user'];
//         console.log("_user ", _user);

//         if (_user === undefined || _user === null) {

//             const error = errorFactory({
//                 msg: "Token mismatch",
//                 statusCode: 404,
//                 type: "token"
//             })
//             throw error;
//         }
//         next();
//     }
// ))

// privateUserRouter.get("/", MakeErrorHandler(
//     async (req: any, res: Response) => {

//         const _user: User = req['user'];
//         const user = await UserController.getUserById(_user.id);
//         res.json(user.body);
//     }
// ));

privateUserRouter.patch("/VerifyUser/:key", MakeErrorHandler(
    async (req: any, res: Response) => {

        const _user: IUser = req['user'];
        const key = req.params.key
        const user = await UserController.verifyUser(_user, key);
        res.json(user.body);
    }
));

// publicUserRouter.get("/:id", MakeErrorHandler(
//     async (req: Request, res: Response) => {

//         const user = await UserController.getUserById(req.params.id);
//         res.json(user.body);
//     }
// ));



publicUserRouter.use("/user", publicUserRouter);
privateUserRouter.use("/user", privateUserRouter);


export { publicUserRouter, privateUserRouter } 