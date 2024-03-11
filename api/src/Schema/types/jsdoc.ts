export const organizerJsdocSchema =
{
    type: 'object',
    properties: {
        _id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string', nullable: true },
        phone: { type: 'string' },
        logoURL: { type: 'string', nullable: true },
        verified: { type: 'object' },
        password: { type: 'string' },
        categorys: { type: 'array', items: { type: 'string' } },
        events: { type: 'array', items: { type: 'string' } },
        walletAccounts: { type: 'array', items: { type: 'string' } },
        socialLinks: {
            type: 'object',
            properties: {
                facebook: { type: 'string', nullable: true },
                twitter: { type: 'string', nullable: true },
                instagram: { type: 'string', nullable: true },
                website: { type: 'string', nullable: true },
                youtube: { type: 'string', nullable: true },
                googlePhotos: { type: 'string', nullable: true },
            },
        },
    },
}

export const Error401JsdocSchema = {
    type: 'object',
    properties: {
        error: {
            type: 'object',
            properties: {
                msg: {
                    type: 'string',
                    example: 'No Valid Token',
                },
                statusCode: {
                    type: 'number',
                    example: 401,
                },
                type: {
                    type: 'string',
                    example: 'token',
                },
            },
        },
    }
}

export const organizerSignUpFrom = {
    type: 'object',
    properties: {
        email: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
        phone: {
            type: 'string',
        },
        logoURL: {
            type: 'string',
        },
        password: {
            type: 'string',
        },
        walletAccounts: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
    },
}

export const validationError = {
    type: "object",
    properties: {
        error: {
            type: "object",
            properties: {
                msg: {
                    type: "string",
                    example: "\"email\" must be a valid email"
                },
                statusCode: {
                    type: "number",
                    example: 400
                },
                type: {
                    type: "string",
                    example: "validation"
                },
                attr: {
                    type: "string",
                    example: "email"
                }
            }
        }
    }
}

export const organizerLogInFrom = {
    type: "object",
    properties: {
        email: { type: "string" },
        password: { type: "string" }
    }
}

export const organizerWalletLogInFrom = {
    type: "object",
    properties: {
        walletAccounts: { type: 'array', items: { type: 'string' } },
    }
}