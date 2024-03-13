import express, { Request, Response } from "express";
import { MakeErrorHandler, userOnly } from "../../Util/middlewares";
import TransactionController from "./controller";


const publicTransactionRouter = express.Router();
const privateTransactionRouter = express.Router();

/**
 * @swagger
 * /private/transaction/mint:
 *   patch:
 *     summary: Mint transaction
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/newTransactionJsdocSchema'
 *     responses:
 *       200:
 *         description: Mint transaction successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
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
privateTransactionRouter.patch("/mint", userOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        res.json(await TransactionController.mint(req.body, req['user']));
    }
));


publicTransactionRouter.use("/transaction", publicTransactionRouter);
privateTransactionRouter.use("/transaction", privateTransactionRouter);


export { publicTransactionRouter, privateTransactionRouter } 