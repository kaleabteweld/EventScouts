export interface errorResponse {
    msg: string
    type: string
    statusCode: number
}
export interface ValidationError extends errorResponse {
    attr: string
}