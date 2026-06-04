import api from './api'
import { ISpecialty } from '../Utils/Types/professionalTypes'

export const getSpecialties = async (): Promise<ISpecialty[]> => {
  const response = await api.get('/specialties')
  return response.data
}

export const getSpecialtyById = async (id: string): Promise<ISpecialty> => {
  const response = await api.get(`/specialties/${id}`)
  return response.data
}

export const createSpecialty = async (data: Omit<ISpecialty, '_id'>): Promise<ISpecialty> => {
  const response = await api.post('/specialties', data)
  return response.data
}

export const updateSpecialty = async (id: string, data: Partial<ISpecialty>): Promise<ISpecialty> => {
  const response = await api.put(`/specialties/${id}`, data)
  return response.data
}

export const deleteSpecialty = async (id: string): Promise<void> => {
  await api.delete(`/specialties/${id}`)
}