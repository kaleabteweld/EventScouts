import express, { Request, Response } from "express";
import { MakeErrorHandler, userOnly } from "../../Util/middlewares";
import ReviewController from "./controller";
import { IUser } from "../../Schema/Types/user.schema.types";
import { TReactionType } from "../../Schema/Types/review.schema.types";


const publicReviewRouter = express.Router();
const privateReviewRouter = express.Router();

/**
 * @swagger
 * /public/review/list/{eventId}/{skip}/{limit}:
 *   get:
 *     summary: Get a list of reviews for a specific event
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: ID of the event
 *         schema:
 *           type: string
 *       - in: path
 *         name: skip
 *         required: true
 *         description: Number of items to skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *       - in: path
 *         name: limit
 *         required: true
 *         description: Maximum number of items to return
 *         schema:
 *           type: integer
 *           minimum: 1
        - in: query
 *         name: includeAuthor
 *         required: false
 *         description: Whether to include author information in the reviews
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: includeReactedUsers
 *         required: false
 *         description: Whether to include information about users who reacted to the reviews
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: A list of reviews for the specified event
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 */
publicReviewRouter.get("/list/:eventId/:skip/:limit", MakeErrorHandler(
    async (req: any, res: Response) => {
        const skip = Number.parseInt(req.params.skip);
        const limit = Number.parseInt(req.params.limit);
        const includeAuthor = req.query.includeAuthor === 'true';
        const includeReactedUsers = req.query.includeReactedUsers === 'true';
        const eventId = req.params.eventId
        res.json(await ReviewController.list({ skip, limit }, eventId, includeAuthor, includeReactedUsers));
    }
));

/**
 * @swagger
 * /public/review/byId/{id}:
 *   get:
 *     summary: Get a review by ID
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the review to retrieve
 *         schema:
 *           type: string
         - in: query
 *         name: includeAuthor
 *         required: false
 *         description: Whether to include author information in the reviews
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: includeReactedUsers
 *         required: false
 *         description: Whether to include information about users who reacted to the reviews
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: A review object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Error occurred during search process 
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */
publicReviewRouter.get("/byId/:id", MakeErrorHandler(
    async (req: Request, res: Response) => {
        const includeAuthor = req.query.includeAuthor === 'true';
        const includeReactedUsers = req.query.includeReactedUsers === 'true';
        return res.json(await ReviewController.getById(req.params.id, includeAuthor, includeReactedUsers));
    }
));

/**
 * @swagger
 * /private/review/:
 *   post:
 *     summary: Create a new review
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/newReviewFromJsdocSchema'
 *     responses:
 *       200:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Error occurred during review creation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoValidToken'
 */
privateReviewRouter.post("/", userOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _user: IUser = req['user'];
        res.json(await ReviewController.createReview(req.body, _user));
    }
));

/**
 * @swagger
 * /private/review/react/{id}/{reaction}:
 *   patch:
 *     summary: React to a review
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the review
 *         schema:
 *           type: string
 *       - in: path
 *         name: reaction
 *         required: true
 *         description: Reaction to the review
 *         schema:
 *           type: string
 *           enum: [like, love, haha, wow, sad, angry]
 *     responses:
 *       200:
 *         description: Review reacted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Error occurred during reaction
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoValidToken'
 */
privateReviewRouter.patch("/react/:id/:reaction", userOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _user: IUser = req['user'];
        const _reaction: TReactionType = req.params.reaction;
        const reviewId = req.params.id;
        res.json(await ReviewController.react(reviewId, _reaction, _user));
    }
));


publicReviewRouter.use("/review", publicReviewRouter);
privateReviewRouter.use("/review", privateReviewRouter);


export { publicReviewRouter, privateReviewRouter } 