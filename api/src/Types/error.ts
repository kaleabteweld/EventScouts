export interface errorResponse {
    msg: string
    type: string
    statusCode: number
}
export interface ValidationError extends errorResponse {
    attr: string
}

export function isValidationError(error: errorResponse): error is ValidationError {
    return (error as ValidationError).attr !== undefined;
}