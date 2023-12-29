import mongoose from "mongoose";
import { ValidationErrorFactory } from "../../Util/Factories";

export default function mongooseErrorMiddleware(error: any, doc: Document, next: mongoose.CallbackWithoutResultAndOptionalError) {
    if (error) {
        var _error;
        if (error instanceof mongoose.Error.ValidationError) {
            Object.keys(error.errors).forEach((path) => {
                _error = ValidationErrorFactory({
                    msg: error.errors[path].message,
                    statusCode: 403,
                    type: "validation",
                }, path)
            })


        }
        else if (error.name === 'MongoError' || error.code == 11000) {
            var path = Object.keys(error.keyValue)[0]

            _error = ValidationErrorFactory({
                msg: `${path} can not be duplicate`,
                statusCode: 403,
                type: "validation",
            }, path);
        }
        next(_error as any);
    } else {
        next();
    }
}

export function mongooseErrorPlugin(schema: mongoose.Schema<any>) {
    schema.post('save', mongooseErrorMiddleware);
}