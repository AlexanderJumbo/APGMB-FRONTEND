export interface RegisterRequest {
  name: string;
  userName: string;
  lastname: string;
  dni: string;
  address: string;
  numberPhone: string;
  password: string;
  repeated_password: string;
  role: string;
}
export interface RegisterResponse {
  name: string;
  userId: number;
  username: string;
  role: string;
  jwt: string;
}
export interface UpdateUserRequest {
  userId: number;
  name: string;
  lastname: string;
  userName: string;
  dni: string;
  email: string;
  address: string;
  numberPhone: string;
  password: string;
  repeated_password: string;
  role: 'ADMINISTRATOR' | 'OPERATIONAL' | string;
}
export interface GetUserResponse {
  idUser: number;
  name: string;
  lastname: string;
  userName: string;
  address: string;
  email: string;
  dni: string;
  numberPhone: string;
  photo: string | null;
  dateRegister: string | null;
  role: string;
}



