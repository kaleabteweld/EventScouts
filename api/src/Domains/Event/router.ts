import express, { Request, Response } from "express";
import { MakeErrorHandler, organizerOnly } from "../../Util/middlewares";
import { IOrganizer } from "../../Schema/Types/organizer.schema.types";
import EventController from "./controller";


const publicEventRouter = express.Router();
const privateEventRouter = express.Router();

/**
 * @swagger
 * /public/event/list/{skip}/{limit}:
 *   get:
 *     summary: Get a list of events
 *     tags: [Event]
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
 *     responses:
 *       200:
 *         description: A list of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
publicEventRouter.get("/list/:skip/:limit", MakeErrorHandler(
    async (req: any, res: Response) => {
        const skip = Number.parseInt(req.params.skip);
        const limit = Number.parseInt(req.params.limit);
        res.json(await EventController.list({ skip, limit }));
    }
));

/**
 * @swagger
 * /public/event/search/{page}:
 *   post:
 *     summary: Search for events
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: page
 *         schema:
 *           type: integer
 *         required: true
 *         description: Page number for pagination
 *       - in: body
 *         name: searchCriteria
 *         required: true
 *         description: The criteria for searching events
 *         schema:
 *           $ref: '#/components/schemas/evenSearchFrom'
 *     responses:
 *       200:
 *         description: Successful search operation
 *         content:
 *           application/json:
 *              schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       400:
 *         description: Error occurred during search process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */
publicEventRouter.post("/search/:page", MakeErrorHandler(
    async (req: any, res: Response) => {
        const page = Number.parseInt(req.params.page);
        res.json(await EventController.search(req.body, page));
    }
));

/**
 * @swagger
 * /public/event/search/vector/{page}:
 *   post:
 *     summary: Vector search for events
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: page
 *         schema:
 *           type: integer
 *         required: true
 *         description: Page number for pagination
 *       - in: body
 *         name: searchCriteria
 *         required: true
 *         description: The criteria for searching events
 *         schema:
 *           $ref: '#/components/schemas/evenSearchFrom'
 *     responses:
 *       200:
 *         description: Successful search operation
 *         content:
 *           application/json:
 *              schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       400:
 *         description: Error occurred during search process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */
publicEventRouter.post("/search/vector/:page", MakeErrorHandler(
    async (req: any, res: Response) => {
        const page = Number.parseInt(req.params.page);
        res.json(await EventController.vectorSearch(req.body, page));
    }
));

/**
 * @swagger
 * /public/event/byId/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the event to get
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 * 
 *       400:
 *         description: Error occurred during search process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */
publicEventRouter.get("/byId/:id", MakeErrorHandler(
    async (req: Request, res: Response) => res.json(await EventController.getById(req.params.id))
));

/**
 * @swagger
 * /private/event/:
 *   post:
 *     summary: Create a new event
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/eventCreationRequestSchema'
 *     responses:
 *       200:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Error occurred during event creation
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
privateEventRouter.post("/", organizerOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _eventOrganizer: IOrganizer = req['organizer'];
        res.json(await EventController.createEvent(req.body, _eventOrganizer));
    }
));

/**
 * @swagger
 * /private/event/remove/{eventId}:
 *   delete:
 *     summary: Remove an event by ID
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the event to remove
 *     responses:
 *       200:
 *         description: Event removed successfully
 *       400:
 *         description: Error occurred during event removal
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
privateEventRouter.delete("/remove/:eventId", organizerOnly, MakeErrorHandler(
    async (req: any, res: Response) => {

        const _eventOrganizer: IOrganizer = req['organizer'];
        res.json(await EventController.removeById(req.params.eventId, _eventOrganizer));
    }
));

/**
 * @swagger
 * /private/events/update/{eventId}:
 *   patch:
 *     summary: Update an event
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the event to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/eventUpdateRequestSchema'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Error occurred during event update
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
privateEventRouter.patch("/update/:eventId", organizerOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _eventOrganizer: IOrganizer = req['organizer'];
        res.json(await EventController.update(req.body, req.params.eventId, _eventOrganizer));
    }
));

/**
 * @swagger
 * /private/event/update/ticketType/{eventId}/{ticketTypesId}:
 *   patch:
 *     summary: Update a ticket type of an event
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: The ID of the event
 *         schema:
 *           type: string
 *       - in: path
 *         name: ticketTypesId
 *         required: true
 *         description: The ID of the ticket type
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ticketTypesUpdateSchema'
 *     responses:
 *       200:
 *         description: Ticket type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ticketType'
 *       400:
 *         description: Error occurred during ticket type update
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
privateEventRouter.patch("/update/ticketType/:eventId/:ticketTypesId", organizerOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _organizer: IOrganizer = req['organizer'];
        res.json(await EventController.updateTicketType(req.body, req.params.eventId, req.params.ticketTypesId, _organizer));
    }
));




publicEventRouter.use("/event", publicEventRouter);
privateEventRouter.use("/event", privateEventRouter);


export { publicEventRouter, privateEventRouter } 