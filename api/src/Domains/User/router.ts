import express, { Request, Response } from "express";
import { MakeErrorHandler, userOnly } from "../../Util/middlewares";
import UserController from "./controller";
import { IUser } from "../../Schema/Types/user.schema.types";


const publicUserRouter = express.Router();
const privateUserRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Endpoints for User operations
 */


/**
 * @swagger
 * /private/user:
 *   get:
 *     summary: Get user information
 *     tags: [User]
 *     security:
 *        - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'      
 *       401:
 *         description: No Valid Token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoValidToken'
 */
privateUserRouter.get("/", userOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _user: IUser = req['user'];
        res.json(await UserController.getById(_user));
    }
));


/**
 * @swagger
 * /private/user/VerifyUser/{key}:
 *   patch:
 *     summary: Verify user with verification key
 *     tags: [User]
 *     security:
 *        - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: Verification key for user verification
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User verification successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'      
 *       401:
 *         description: No Valid Token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoValidToken'
 */
privateUserRouter.patch("/VerifyUser/:key", MakeErrorHandler(
    async (req: any, res: Response) => {

        const _user: IUser = req['user'];
        const key = req.params.key
        const user = await UserController.verifyUser(_user, key);
        res.json(user.body);
    }
));

/**
 * @swagger
 * /private/user/remove:
 *   delete:
 *     summary: Remove user
 *     tags: [User]
 *     security:
 *        - bearerAuth: []
 *     responses:
 *       200:
 *         description: User removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'      
 *       401:
 *         description: No Valid Token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoValidToken'
 */
privateUserRouter.delete("/remove", userOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _user: IUser = req['user'];
        res.json(await UserController.removeById(_user.id, _user));
    }
));

/**
 * @swagger
 * /private/user/update:
 *   patch:
 *     summary: Update user
 *     tags: [User]
 *     security:
 *        - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/userUpdateJsdocSchema'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'      
 *       401:
 *         description: No Valid Token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoValidToken'
 */
privateUserRouter.patch("/update", userOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _user: IUser = req['user'];
        res.json(await UserController.update(req.body, _user.id));
    }
));

/**
 * @swagger
 * /transactions/{skip}/{limit}:
 *   get:
 *     summary: Get transactions for a user with pagination.
 *     tags: [Transactions,User]
 *     security:
 *        - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skip
 *         required: true
 *         description: Number of transactions to skip.
 *         schema:
 *           type: integer
 *       - in: path
 *         name: limit
 *         required: true
 *         description: Maximum number of transactions to return.
 *         schema:
 *           type: integer
 *     responses:
 *      200:
 *         description: A list of transactions for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'      
 *       401:
 *         description: No Valid Token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoValidToken'
 */

privateUserRouter.get("/transactions/:skip/:limit", userOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _user: IUser = req['user'];
        const skip = Number.parseInt(req.params.skip);
        const limit = Number.parseInt(req.params.limit);
        res.json(await UserController.getUserTransactions(_user.id, { skip, limit }));
    }
));

publicUserRouter.use("/user", publicUserRouter);
privateUserRouter.use("/user", privateUserRouter);


export { publicUserRouter, privateUserRouter } 