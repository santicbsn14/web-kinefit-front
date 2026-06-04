import api from './api'
import { LoginDTO, RegisterDTO, AuthResponse } from '../Utils/Types/userTypes'

export const login = async (data: LoginDTO): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data)
  return response.data
}

export const register = async (data: RegisterDTO): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data)
  return response.data
}