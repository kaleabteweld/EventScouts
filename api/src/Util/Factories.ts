import express from "express";
import appRouter from "../Routes";
import { errorResponse, ValidationError } from "../Types/error"
import { errorMiddleWare } from "./middlewares";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";


export function errorFactory(error: errorResponse): errorResponse {
    return error;
}
export function isErrRes(error: any): error is errorResponse {
    return error.statusCode !== undefined;
}
export function ValidationErrorFactory(error: errorResponse, attr: string): ValidationError {

    return <ValidationError>{
        ...error,
        attr
    }
}
export function makeServer() {
    const app = express();

    app.use(helmet())
    app.disable('x-powered-by')
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static("public"));

    app.use((req, _, next) => {
        console.log("[->] ", req.method, req.url);
        next();
    })

    app.use(appRouter);
    app.use(errorMiddleWare);

    app.use(
        "/docs",
        swaggerUi.serve,
        swaggerUi.setup(undefined, {
            swaggerOptions: {
                url: "/swagger.json",
                explorer: true
            },
        })
    );

    return app;
}