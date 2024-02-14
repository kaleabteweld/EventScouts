import express from "express";
import { publicAuthenticationRouter, privateAuthenticationRouter } from "../Domains/Authentication";
import { privateUserRouter, publicUserRouter } from "../Domains/User";
import { privateOrganizerRouter, publicOrganizerRouter } from "../Domains/Organizer";

const publicRouter = express.Router();
const privateRouter = express.Router();

publicRouter.use([publicAuthenticationRouter, publicUserRouter, publicOrganizerRouter]);
privateRouter.use([privateAuthenticationRouter, privateUserRouter, privateOrganizerRouter]);


export { publicRouter, privateRouter }