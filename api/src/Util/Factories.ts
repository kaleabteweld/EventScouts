import express from "express";
import appRouter from "../Routes";
import { errorResponse, ValidationError } from "../Types/error"
import { errorMiddleWare } from "./middlewares";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";
import swaggerJsdoc from 'swagger-jsdoc'
import { Error401JsdocSchema, evenSearchFrom, eventCreationRequestSchema, eventJsdocSchema, eventUpdateRequestSchema, organizerJsdocSchema, organizerLogInFrom, organizerSignUpFrom, organizerUpdateFrom, organizerWalletLogInFrom, ticketTypeJsdocSchema, ticketTypesUpdateSchema, validationError } from "../Schema/Types/jsdoc";

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

    const options: swaggerJsdoc.Options = {
        swaggerDefinition: {
            openapi: '3.0.1',
            info: {
                title: 'EventScouts API',
                version: '1.0.0',
                description: 'API documentation for EventScouts',
            },
            servers: [
                {
                    url: `http://localhost:${process.env.APP_PORT || 5000}/Api/v1`,
                    description: 'Development server',
                },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    }
                },
                schemas: {
                    Organizer: organizerJsdocSchema,
                    NoValidToken: Error401JsdocSchema,
                    organizerSignUpFrom: organizerSignUpFrom,
                    validationError: validationError,
                    organizerLogInFrom: organizerLogInFrom,
                    organizerWalletLogInFrom: organizerWalletLogInFrom,
                    organizerUpdateFrom: organizerUpdateFrom,
                    Event: eventJsdocSchema,
                    evenSearchFrom: evenSearchFrom,
                    eventCreationRequestSchema: eventCreationRequestSchema,
                    eventUpdateRequestSchema: eventUpdateRequestSchema,
                    ticketTypesUpdateSchema: ticketTypesUpdateSchema,
                    ticketType: ticketTypeJsdocSchema,
                },
            },
            security: [{
                bearerAuth: []
            }],
            securityDefinitions: {
                bearerAuth: {
                    type: 'apiKey',
                    name: 'Authorization',
                    scheme: 'bearer',
                    in: 'header',
                },
            },
        },
        apis: ['./src/Domains/*/router.ts'],
    };

    const specs = swaggerJsdoc(options);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

    return app;
}