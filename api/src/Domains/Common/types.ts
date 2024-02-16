export interface IChangePasswordFrom {
    password: string
}

export interface IPagination {
    skip?: number,
    limit?: number,
}

export interface IResponseType<T> {
    body: T
}

export interface IResponseWithHeaderType<T> {
    body: T
    header: {
        accessToken: string
        refreshToken: string
    }
}

export interface IListResponseType<T> {
    body: T,
    pagination: IPagination
}

export interface IEmailOTPResponseType {
    email: string,
}

export interface IEmailOTPVerifyResponseType {
    email: string,
    code: string,
    status: boolean
}

export interface IPhoneOTPResponseType {
    phone: string,
    verificationId: string
}

export interface IPhoneOTPVerifyResponseType {
    phone: string,
    code: string,
    status: boolean
}