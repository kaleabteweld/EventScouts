import express from "express";
import { publicAuthenticationRouter, privateAuthenticationRouter } from "../Domains/Authentication";
import { privateUserRouter, publicUserRouter } from "../Domains/User";
import { privateOrganizerRouter, publicOrganizerRouter } from "../Domains/Organizer";
import { privateEventRouter, publicEventRouter } from "../Domains/Event";
import { privateCategoryRouter, publicCategoryRouter } from "../Domains/Category";

const publicRouter = express.Router();
const privateRouter = express.Router();

publicRouter.use([publicAuthenticationRouter, publicUserRouter, publicOrganizerRouter, publicEventRouter, publicCategoryRouter]);
privateRouter.use([privateAuthenticationRouter, privateUserRouter, privateOrganizerRouter, privateEventRouter, privateCategoryRouter]);


export { publicRouter, privateRouter }