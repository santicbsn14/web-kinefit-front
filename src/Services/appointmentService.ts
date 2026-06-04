import api from './api'
import { IAppointment, CreateAppointmentDTO, PaginatedResult } from '../Utils/Types/appointmentTypes'

export const getAppointments = async (page = 1, limit = 10): Promise<PaginatedResult<IAppointment>> => {
  const response = await api.get('/appointments', { params: { page, limit } })
  return response.data
}

export const getAppointmentById = async (id: string): Promise<IAppointment> => {
  const response = await api.get(`/appointments/${id}`)
  return response.data
}

export const getMyAppointments = async (page = 1, limit = 10): Promise<PaginatedResult<IAppointment>> => {
  const response = await api.get('/appointments/mine', { params: { page, limit } })
  return response.data
}

export const getAppointmentsByProfessional = async (professionalId: string, page = 1, limit = 10): Promise<PaginatedResult<IAppointment>> => {
  const response = await api.get(`/appointments/professional/${professionalId}`, { params: { page, limit } })
  return response.data
}

export const createAppointment = async (data: CreateAppointmentDTO): Promise<IAppointment> => {
  const response = await api.post('/appointments', data)
  return response.data
}

export const approveAppointment = async (id: string, secretaryNotes?: string): Promise<IAppointment> => {
  const response = await api.patch(`/appointments/${id}/approve`, { secretaryNotes })
  return response.data
}

export const rejectAppointment = async (id: string, secretaryNotes?: string): Promise<IAppointment> => {
  const response = await api.patch(`/appointments/${id}/reject`, { secretaryNotes })
  return response.data
}

export const cancelAppointmentByPatient = async (id: string): Promise<IAppointment> => {
  const response = await api.patch(`/appointments/${id}/cancel`)
  return response.data
}

export const cancelAppointmentBySecretary = async (id: string, secretaryNotes?: string): Promise<IAppointment> => {
  const response = await api.patch(`/appointments/${id}/cancel-secretary`, { secretaryNotes })
  return response.data
}