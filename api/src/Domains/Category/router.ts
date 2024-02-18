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

publicCategoryRouter.get("/list/:skip/:limit", MakeErrorHandler(
    async (req: any, res: Response) => {
        const skip = Number.parseInt(req.params.skip);
        const limit = Number.parseInt(req.params.limit);
        res.json(await CategoryController.list({ skip, limit }));
    }
));

publicCategoryRouter.get("/byId/:id", MakeErrorHandler(
    async (req: Request, res: Response) => res.json(await CategoryController.getById(req.params.id))
));


publicCategoryRouter.use("/category", publicCategoryRouter);
privateCategoryRouter.use("/category", privateCategoryRouter);


export { publicCategoryRouter, privateCategoryRouter } 