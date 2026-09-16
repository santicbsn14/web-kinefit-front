import api from './api'
import { IPatient } from '../Utils/Types/userTypes'
import { PaginatedResult } from '../Utils/Types/appointmentTypes'

export const getPatients = async (page = 1, limit = 100): Promise<PaginatedResult<IPatient>> => {
  const response = await api.get('/patients', { params: { page, limit } })
  return response.data
}
