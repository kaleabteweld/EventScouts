import express, { Request, Response } from "express";
import { MakeErrorHandler, organizerOnly } from "../../Util/middlewares";
import { CategoryController } from ".";
import { IOrganizer } from "../../Schema/Types/organizer.schema.types";


const publicCategoryRouter = express.Router();
const privateCategoryRouter = express.Router();

/**
 * @swagger
 * /private/category:
 *   post:
 *     summary: Create a new category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/categoryCreationRequestSchema'
 *     responses:
 *       200:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Error occurred during category creation
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
privateCategoryRouter.post("/", organizerOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _eventOrganizer: IOrganizer = req['organizer'];
        res.json(await CategoryController.createCategory(req.body, _eventOrganizer));
    }
));

/**
 * @swagger
 * /public/category/list/{skip}/{limit}:
 *   get:
 *     summary: Get a list of categories
 *     tags: [Category]
 *     parameters:
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
 *       - in: query
 *         name: withEventCount
 *         schema:
 *           type: boolean
 *         description: Include the count of events associated with each category
 *     responses:
 *       200:
 *         description: A list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategoryWithEventCount'
 */
publicCategoryRouter.get("/list/:skip/:limit", MakeErrorHandler(
    async (req: any, res: Response) => {
        const skip = Number.parseInt(req.params.skip);
        const limit = Number.parseInt(req.params.limit);
        const withEventCount = Boolean(req.query.withEventCount) || false;
        res.json(await CategoryController.list({ skip, limit }, withEventCount));
    }
));

/**
 * @swagger
 * /public/category/byId/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the category to retrieve
 *         schema:
 *           type: string
 *       - in: query
 *         name: withEventCount
 *         schema:
 *           type: boolean
 *         description: Include the count of events associated with each category
 *     responses:
 *       200:
 *         description: The requested category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryWithEventCount'
 */
publicCategoryRouter.get("/byId/:id", MakeErrorHandler(
    async (req: Request, res: Response) => {
        const withEventCount = Boolean(req.query.withEventCount) || false;
        res.json(await CategoryController.getById(req.params.id, withEventCount))
    }
));

/**
 * @swagger
 * /private/category/remove/{categoryId}:
 *   delete:
 *     summary: Remove a category by ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: ID of the category to remove
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoValidToken'
 */
privateCategoryRouter.delete("/remove/:categoryId", organizerOnly, MakeErrorHandler(
    async (req: any, res: Response) => {

        const _eventOrganizer: IOrganizer = req['organizer'];
        res.json(await CategoryController.removeById(req.params.categoryId, _eventOrganizer,));
    }
));


publicCategoryRouter.use("/category", publicCategoryRouter);
privateCategoryRouter.use("/category", privateCategoryRouter);


export { publicCategoryRouter, privateCategoryRouter } 