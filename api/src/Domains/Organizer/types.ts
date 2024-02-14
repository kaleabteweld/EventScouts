export interface IOrganizerLogInFrom {
    email: string,
    password: string
}

export interface IOrganizerSignUpFrom {
    email: string,
    name: string,
    phone: string,
    logoURL?: String,
    password: string,
}