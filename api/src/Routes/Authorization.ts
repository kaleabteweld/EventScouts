import express from "express";
import { publicAuthenticationRouter, privateAuthenticationRouter } from "../Domains/Authentication";
import { privateUserRouter, publicUserRouter } from "../Domains/User";

const publicRouter = express.Router();
const privateRouter = express.Router();

publicRouter.use([publicAuthenticationRouter, publicUserRouter]);
privateRouter.use([privateAuthenticationRouter, privateUserRouter]);


export { publicRouter, privateRouter }