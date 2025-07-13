export interface AccountRequest {
    name: string;
    lastname: string;
    email: string;
    dni: string;
    address: string;
    phone: string;
    role: string;
    meterNumber: string;
    meterMark: string;
    predialCode: string;
    nameSector: string;
}

export interface AccountQueryParams {
    isActive?: boolean;
    sector?: string;
}

export interface AccountResponse {
    accountId: number;
    message: string;
}
export interface GetAccountListResponse {
    accountId: number;
    userId: number;
    name: string;
    lastname: string;
    dni: string;
    address: string;
    phone: string;
    email: string;
    meterId: number;
    meterNumber: string;
    meterMark: string;
    predialCode: string;
    dateRegister: Date | null;
    nameSector: string
    active: boolean;
}
export interface AccountRequestUpdate {
    accountId: number;
    userId: number;
    meterId: number;
    name: string;
    lastname: string;
    dni: string;
    email: string;
    address: string;
    phone: string;
    meterNumber: string;
    meterMark: string;
    role: string;
    predialCode: string;
    nameSector: string;
}





