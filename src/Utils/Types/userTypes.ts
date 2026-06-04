export type Role = 'patient' | 'professional' | 'secretary' | 'admin'

export interface IUser {
  _id: string
  name: string
  email: string
  role: Role
  createdAt?: Date
}

export interface IPatient {
  _id: string
  userId: IUser | string
  dni: string
  phone: string
  birthDate: Date | string
  medicalHistory?: string
  createdAt?: Date
}

export interface LoginDTO {
  email: string
  password: string
}

export interface RegisterDTO {
  name: string
  email: string
  password: string
  dni: string
  phone: string
  birthDate: string
}

export interface AuthResponse {
  user: IUser
  token: string
}