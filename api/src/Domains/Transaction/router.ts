import express, { Request, Response } from "express";
import { MakeErrorHandler, userOnly } from "../../Util/middlewares";
import TransactionController from "./controller";


const publicTransactionRouter = express.Router();
const privateTransactionRouter = express.Router();

privateTransactionRouter.patch("/mint", userOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        res.json(await TransactionController.mint(req.body, req['user']));
    }
));


publicTransactionRouter.use("/transaction", publicTransactionRouter);
privateTransactionRouter.use("/transaction", privateTransactionRouter);


export { publicTransactionRouter, privateTransactionRouter } 