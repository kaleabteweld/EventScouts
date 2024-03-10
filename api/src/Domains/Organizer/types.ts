export interface IOrganizerLogInFrom {
    email: string,
    password: string
}

export interface IOrganizerSignUpFrom {
    email: string,
    name: string,
    phone: string,
    logoURL: String,
    password: string,
    walletAccounts: string[]
}

export interface IOrganizerLogInFromWithWallet {
    walletAccounts: string[]
}

export interface IOrganizerUpdateFrom extends Omit<Partial<IOrganizerSignUpFrom>, "password"> {
    socialLinks: { facebook?: string, twitter?: string, instagram?: string, website?: string, youtube?: string, googlePhotos?: string }
}