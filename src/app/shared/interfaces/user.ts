export interface IUser {
    uid: string;
    displayName: string;
    email: string;
    photoUrl: string;
    roles: IRoles[];
    active: boolean;
    disabled: boolean;
    accountId: string;
    firstName: string;
    lastName: string;
    password?: string;

}

export interface IUserCredentials {
    email: string;
    password: string;
}

export interface IRoles {
    role: string;
}
