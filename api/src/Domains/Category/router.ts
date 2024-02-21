import express, { Request, Response } from "express";
import { MakeErrorHandler, adminOnly, organizerOnly } from "../../Util/middlewares";
import { CategoryController } from ".";
import { IOrganizer } from "../../Schema/Types/organizer.schema.types";


const publicCategoryRouter = express.Router();
const privateCategoryRouter = express.Router();

privateCategoryRouter.post("/", organizerOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _eventOrganizer: IOrganizer = req['organizer'];
        res.json(await CategoryController.createCategory(req.body, _eventOrganizer));
    }
));

publicCategoryRouter.get("/list/:skip/:limit", MakeErrorHandler(
    async (req: any, res: Response) => {
        const skip = Number.parseInt(req.params.skip);
        const limit = Number.parseInt(req.params.limit);
        const withEventCount = Boolean(req.query.withEventCount) || false;
        res.json(await CategoryController.list({ skip, limit }, withEventCount));
    }
));

publicCategoryRouter.get("/byId/:id", MakeErrorHandler(
    async (req: Request, res: Response) => {
        const withEventCount = Boolean(req.query.withEventCount) || false;
        res.json(await CategoryController.getById(req.params.id, withEventCount))
    }
));

privateCategoryRouter.delete("/remove/:categoryId", organizerOnly, MakeErrorHandler(
    async (req: any, res: Response) => {

        const _eventOrganizer: IOrganizer = req['organizer'];
        res.json(await CategoryController.removeById(req.params.categoryId, _eventOrganizer,));
    }
));


publicCategoryRouter.use("/category", publicCategoryRouter);
privateCategoryRouter.use("/category", privateCategoryRouter);


export { publicCategoryRouter, privateCategoryRouter } 