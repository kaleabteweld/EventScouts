import express from "express";
import { publicAuthenticationRouter, privateAuthenticationRouter } from "../Domains/Authentication";
import { privateUserRouter, publicUserRouter } from "../Domains/User";
import { privateOrganizerRouter, publicOrganizerRouter } from "../Domains/Organizer";
import { privateEventRouter, publicEventRouter } from "../Domains/Event";
import { privateCategoryRouter, publicCategoryRouter } from "../Domains/Category";
import { privateReviewRouter, publicReviewRouter } from "../Domains/Review";

const publicRouter = express.Router();
const privateRouter = express.Router();

publicRouter.use([publicAuthenticationRouter, publicUserRouter, publicOrganizerRouter, publicEventRouter, publicCategoryRouter, publicReviewRouter]);
privateRouter.use([privateAuthenticationRouter, privateUserRouter, privateOrganizerRouter, privateEventRouter, privateCategoryRouter, privateReviewRouter]);


export { publicRouter, privateRouter }