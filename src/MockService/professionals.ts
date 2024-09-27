import axios from "axios";
import { handleError } from "../Utils/ErrorManager/handleApiError";
import { ProfessionalTimeSlots } from "../Utils/Types/professionalTypes";
export interface Professional {
  user_id: string,
  _id?: string,
  specialties: string[]
}

export const getProfessionals = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/professionals')
      return response.data
    } catch (error) {
      const errorhandler = handleError(error)
      throw Error(errorhandler)
    }
  }
export const createProfessional = async (data: Professional) => {
  try {
    const response = await axios.post('http://localhost:8080/api/professionals', data)
    return response.data
  } catch (error) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}
export const deleteProfessional = async (id: string) => {
  try {
    const response = await axios.delete(`http://localhost:8080/api/professionals/${id}`,)
    return response.data
  } catch (error) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}
export const createProfessionalTimeSlots = async (data:ProfessionalTimeSlots) => {
  try {
    const response = await axios.post(`http://localhost:8080/api/professionalTimeSlots`, data)
    return response.data
  } catch (error) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}
export const getProfessionalTimeSlots = async (id:string) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/professionalTimeSlots/bypro/${id}`)
    if(response.data=== null){ throw new Error('Error al cargar los horarios')}
    return response.data
  } catch (error) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}
export const updateProfessionalTimeSlots = async(id:string, data:Partial<Professional>) => {
  try {
    const response = await axios.put(`http://localhost:8080/api/professionalTimeSlots/${id}`, data)
    
    return response.data
  } catch (error) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}