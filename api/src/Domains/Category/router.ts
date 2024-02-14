import express, { Request, Response } from "express";
import { MakeErrorHandler, organizerOnly } from "../../Util/middlewares";
import { CategoryController } from ".";


const publicCategoryRouter = express.Router();
const privateCategoryRouter = express.Router();

privateCategoryRouter.post("/", organizerOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        res.json(await CategoryController.createCategory(req.body));
    }
));


publicCategoryRouter.use("/category", publicCategoryRouter);
privateCategoryRouter.use("/category", privateCategoryRouter);


export { publicCategoryRouter, privateCategoryRouter } 