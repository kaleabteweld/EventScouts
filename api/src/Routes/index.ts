import express from "express";
import { JWTMiddleWare } from "../Util/middlewares";
import { privateRouter, publicRouter } from "./Authorization";

const appRouter = express.Router();


appRouter.use("/Api/v1/public/", publicRouter);
appRouter.use("/Api/v1/private/", JWTMiddleWare, privateRouter);


export default appRouter;