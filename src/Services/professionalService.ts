import api from './api'
import { IProfessional, ISchedule } from '../Utils/Types/professionalTypes'

export const getProfessionals = async (): Promise<IProfessional[]> => {
  const response = await api.get('/professionals')
  return response.data
}

export const getProfessionalById = async (id: string): Promise<IProfessional> => {
  const response = await api.get(`/professionals/${id}`)
  return response.data
}

export const createProfessional = async (data: {
  name: string
  email: string
  password: string
  specialties: string[]
}): Promise<IProfessional> => {
  const response = await api.post('/professionals', data)
  return response.data
}

export const setProfessionalSchedule = async (id: string, weeklySlots: ISchedule['weeklySlots']): Promise<ISchedule> => {
  const response = await api.put(`/professionals/${id}/schedule`, { weeklySlots })
  return response.data
}

export const addSpecialtyToProfessional = async (professionalId: string, specialtyId: string): Promise<IProfessional> => {
  const response = await api.post(`/professionals/${professionalId}/specialties`, { specialtyId })
  return response.data
}

export const removeSpecialtyFromProfessional = async (professionalId: string, specialtyId: string): Promise<IProfessional> => {
  const response = await api.delete(`/professionals/${professionalId}/specialties/${specialtyId}`)
  return response.data
}

export const deleteProfessional = async (id: string): Promise<void> => {
  await api.delete(`/professionals/${id}`)
}