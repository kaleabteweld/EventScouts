import express from "express";
import { publicAuthenticationRouter, privateAuthenticationRouter } from "../Domains/Authentication";
import { privateUserRouter, publicUserRouter } from "../Domains/User";
import { privateOrganizerRouter, publicOrganizerRouter } from "../Domains/Organizer";
import { privateEventRouter, publicEventRouter } from "../Domains/Event";
import { privateCategoryRouter, publicCategoryRouter } from "../Domains/Category";
import { privateReviewRouter, publicReviewRouter } from "../Domains/Review";
import { privateTicketTypesRouter, publicTicketTypesRouter } from "../Domains/TicketTypes";
import { privateTransactionRouter, publicTransactionRouter } from "../Domains/Transaction";

const publicRouter = express.Router();
const privateRouter = express.Router();

publicRouter.use([publicAuthenticationRouter, publicUserRouter, publicOrganizerRouter, publicEventRouter, publicCategoryRouter, publicReviewRouter, publicTicketTypesRouter, publicTransactionRouter]);
privateRouter.use([privateAuthenticationRouter, privateUserRouter, privateOrganizerRouter, privateEventRouter, privateCategoryRouter, privateReviewRouter, privateTicketTypesRouter, privateTransactionRouter]);


export { publicRouter, privateRouter }