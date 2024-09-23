
export interface userMoongose {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    age: number;
    dni: number;
    homeAdress: string | number;
    phone: number;
    role: string;
    status: boolean;
    id: string;
}
export interface userLoginSucces {
    accessToken: string,
    uid:string,
    email: string
}
