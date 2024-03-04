import express, { Request, Response } from "express";
import { MakeErrorHandler, userOnly } from "../../Util/middlewares";
import ReviewController from "./controller";
import { IUser } from "../../Schema/Types/user.schema.types";
import { TReactionType } from "../../Schema/Types/review.schema.types";


const publicReviewRouter = express.Router();
const privateReviewRouter = express.Router();

publicReviewRouter.get("/list/:eventId/:skip/:limit", MakeErrorHandler(
    async (req: any, res: Response) => {
        const skip = Number.parseInt(req.params.skip);
        const limit = Number.parseInt(req.params.limit);
        const eventId = req.params.eventId
        res.json(await ReviewController.list({ skip, limit }, eventId));
    }
));

publicReviewRouter.get("/byId/:id", MakeErrorHandler(
    async (req: Request, res: Response) => res.json(await ReviewController.getById(req.params.id))
));

privateReviewRouter.post("/", userOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _user: IUser = req['user'];
        res.json(await ReviewController.createReview(req.body, _user));
    }
));

privateReviewRouter.patch("/react/:id/:reaction", userOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _user: IUser = req['user'];
        const _reaction: TReactionType = req.params.reaction;
        const reviewId = req.params.id;
        res.json(await ReviewController.react(reviewId, _reaction, _user));
    }
));

// privateReviewRouter.delete("/remove/:reviewId", userOnly, MakeErrorHandler(
//     async (req: any, res: Response) => {
//         const _user: IUser = req['user'];
//         res.json(await ReviewController.removeById(req.params.reviewId, _user));
//     }
// ));

// privateReviewRouter.patch("/update/:reviewId", organizerOnly, MakeErrorHandler(
//     async (req: any, res: Response) => {
//         const _user: IUser = req['user'];
//         res.json(await ReviewController.update(req.body, req.params.reviewId, _user));
//     }
// ));



publicReviewRouter.use("/review", publicReviewRouter);
privateReviewRouter.use("/review", privateReviewRouter);


export { publicReviewRouter, privateReviewRouter } 