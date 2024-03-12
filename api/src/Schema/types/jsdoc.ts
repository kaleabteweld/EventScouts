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

export const organizerUpdateFrom = {
    type: 'object',
    properties: {
        email: { type: 'string', nullable: true },
        name: { type: 'string', nullable: true },
        phone: { type: 'string', nullable: true },
        logoURL: { type: 'string', nullable: true },
        walletAccounts: { type: 'array', items: { type: 'string', nullable: true } },
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

export const eventJsdocSchema = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        posterURL: { type: 'string' },
        description: { type: 'string' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        location: {
            type: 'object',
            properties: {
                type: { type: 'string', enum: ['Point'] },
                coordinates: { type: 'array', items: { type: 'number' } },
            },
        },
        venue: { type: 'string' },
        ageRating: { type: 'string' },
        minimumTicketPrice: { type: 'number' },
        shareableLink: { type: 'string' },
        rating: {
            type: 'object',
            properties: {
                avgRating: { type: 'number' },
                ratingCount: { type: 'number' },
            },
        },
        organizer: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                logoURL: { type: 'string' },
                organizer: { type: 'string' },
            },
        },
        categorys: { type: 'array', items: { type: 'string' } },
        ticketTypes: {
            type: 'array', items: {
                type: 'object',
                properties: {
                    posterURl: { type: 'string', nullable: true },
                    type: { type: 'string' },
                    price: { type: 'number' },
                    sellingStartDate: { type: 'string', format: 'date-time' },
                    sellingEndDate: { type: 'string', format: 'date-time' },
                    maxNumberOfTickets: { type: 'number', nullable: true },
                    description: { type: 'string' },
                    refundable: { type: 'boolean', nullable: true },
                    online: { type: 'string', nullable: true },
                    transactionHash: { type: 'string', nullable: true },
                },
            }
        },
        reviews: { type: 'array', items: { type: 'string' } },
        users: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    username: { type: 'string' },
                    profilePic: { type: 'string' },
                    user: { type: 'string' },
                },
            },
        },
        userTotal: { type: 'number' },
    },
};

export const ticketTypeJsdocSchema = {
    type: 'object',
    properties: {
        posterURl: { type: 'string', nullable: true },
        type: { type: 'string' },
        price: { type: 'number' },
        sellingStartDate: { type: 'string', format: 'date-time' },
        sellingEndDate: { type: 'string', format: 'date-time' },
        maxNumberOfTickets: { type: 'number', nullable: true },
        description: { type: 'string' },
        refundable: { type: 'boolean', nullable: true },
        online: { type: 'string', nullable: true },
        transactionHash: { type: 'string', nullable: true },
    },
};

export const evenSearchFrom = {
    type: 'object',
    properties: {
        search: {
            type: 'object',
            properties: {
                name: { type: 'string', nullable: true },
                startDate: { type: 'string', format: 'date-time', nullable: true },
                endDate: { type: 'string', format: 'date-time', nullable: true },
                location: {
                    type: 'object',
                    properties: {
                        longitude: { type: 'number', nullable: true },
                        latitude: { type: 'number', nullable: true },
                    },
                },
                ageRating: { type: 'string', nullable: true },
                organizer: { type: 'string', nullable: true },
                categorys: { type: 'array', items: { type: 'string' }, nullable: true },
                minPrice: { type: 'number', nullable: true },
                maxPrice: { type: 'number', nullable: true },
                search: { type: 'string', nullable: true },
                amountOfPeopleComing: { type: 'number', nullable: true },
                fullText: { type: 'string', nullable: true },
            }
        },
        sort: {
            type: 'object',
            properties: {
                name: { type: 'string', enum: ['asc', 'desc'], nullable: true },
                startDate: { type: 'string', enum: ['asc', 'desc'], nullable: true },
                endDate: { type: 'string', enum: ['asc', 'desc'], nullable: true },
                ageRating: { type: 'string', enum: ['asc', 'desc'], nullable: true },
                organizer: { type: 'string', enum: ['asc', 'desc'], nullable: true },
                categorys: { type: 'string', enum: ['asc', 'desc'], nullable: true },
                minPrice: { type: 'string', enum: ['asc', 'desc'], nullable: true },
                maxPrice: { type: 'string', enum: ['asc', 'desc'], nullable: true },
                amountOfPeopleComing: { type: 'string', enum: ['asc', 'desc'], nullable: true },
                fullText: { type: 'string', enum: ['asc', 'desc'], nullable: true },
            },
            nullable: true
        }
    }
}

export const eventCreationRequestSchema = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        posterURL: { type: 'string' },
        description: { type: 'string' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        location: {
            type: 'object',
            properties: {
                type: { type: 'string', enum: ['Point'] },
                coordinates: { type: 'array', items: { type: 'number' } },
            },
        },
        venue: { type: 'string' },
        ageRating: { type: 'string' },
        categorys: { type: 'array', items: { type: 'string' } },
        ticketTypes: {
            type: 'array', items: {
                type: 'object',
                properties: {
                    posterURl: { type: 'string', nullable: true },
                    type: { type: 'string' },
                    price: { type: 'number' },
                    sellingStartDate: { type: 'string', format: 'date-time' },
                    sellingEndDate: { type: 'string', format: 'date-time' },
                    maxNumberOfTickets: { type: 'number', nullable: true },
                    description: { type: 'string' },
                    refundable: { type: 'boolean', nullable: true },
                    online: { type: 'string', nullable: true },
                    transactionHash: { type: 'string', nullable: true },
                },
            }
        },
    },
};

export const ticketTypesUpdateSchema = {
    type: 'object',
    properties: {
        posterURl: { type: 'string', nullable: true },
        type: { type: 'string', nullable: true },
        price: { type: 'number', nullable: true },
        sellingStartDate: { type: 'string', format: 'date-time', nullable: true },
        sellingEndDate: { type: 'string', format: 'date-time', nullable: true },
        maxNumberOfTickets: { type: 'number', nullable: true },
        description: { type: 'string', nullable: true },
        refundable: { type: 'boolean', nullable: true },
        online: { type: 'string', nullable: true },
        transactionHash: { type: 'string', nullable: true },
    },
};

export const eventUpdateRequestSchema = {
    type: 'object',
    properties: {
        name: { type: 'string', nullable: true },
        posterURL: { type: 'string', nullable: true },
        description: { type: 'string', nullable: true },
        startDate: { type: 'string', format: 'date-time', nullable: true },
        endDate: { type: 'string', format: 'date-time', nullable: true },
        location: {
            type: 'object',
            properties: {
                type: { type: 'string', enum: ['Point'], nullable: true },
                coordinates: { type: 'array', items: { type: 'number' }, nullable: true },
            },
        },
        venue: { type: 'string', nullable: true },
        ageRating: { type: 'string', nullable: true },
        categorys: { type: 'array', items: { type: 'string' }, nullable: true },
        ticketTypes: { type: 'array', items: { type: 'object', properties: { ...ticketTypesUpdateSchema.properties } }, nullable: true },
    },
};

export const categoryCreationRequestSchema = {
    type: 'object',
    properties: {
        name: { type: 'string' },
    },
};

export const categoryJsdocSchema = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        events: { type: 'array', items: { type: 'string' } },
        organizer: { type: 'string' },
    },
};
export const categoryWithEventCountJsdocSchema = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        events: { type: 'array', items: { type: 'string' } },
        organizer: { type: 'string' },
        eventCount: { type: 'number' },
    },
};

export const reviewReactionJsdocSchema = {
    type: 'object',
    properties: {
        emoji: { type: 'string' },
        count: { type: 'number' },
        users: { type: 'array', items: { type: 'string' } }
    }
};

export const reviewJsdocSchema = {
    type: 'object',
    properties: {
        event: { type: 'string' },
        rating: { type: 'number' },
        review: { type: 'string' },
        user: {
            type: 'object',
            properties: {
                username: { type: 'string' },
                profilePic: { type: 'string' },
                user: { type: 'string' }
            }
        },
        reactedUsers: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    username: { type: 'string' },
                    profilePic: { type: 'string' },
                    reaction: { type: 'string' },
                    user: { type: 'string' }
                }
            }
        },
        reactions: {
            type: 'object',
            properties: {
                like: { $ref: '#/components/schemas/ReviewReaction' },
                love: { $ref: '#/components/schemas/ReviewReaction' },
                haha: { $ref: '#/components/schemas/ReviewReaction' },
                wow: { $ref: '#/components/schemas/ReviewReaction' },
                sad: { $ref: '#/components/schemas/ReviewReaction' },
                angry: { $ref: '#/components/schemas/ReviewReaction' }
            }
        }
    }
};

export const newReviewFromJsdocSchema = {
    type: 'object',
    properties: {
        event: { type: 'string' },
        rating: { type: 'number' },
        review: { type: 'string' }
    }
};


