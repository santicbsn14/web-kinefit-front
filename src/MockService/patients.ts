import axios from "axios";
import { handleError } from "../Utils/ErrorManager/handleApiError";

export interface Patient {
  _id?: string;
  user_id:  {_id:string, firstname: string, lastname: string};
  mutual?: string;
  clinical_data: unknown[] | string;
}
export const getPatients = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/patients')
      return response.data
    } catch (error) {
      const errorhandler = handleError(error)
      throw Error(errorhandler)
    }
  }
export const createPatient = async (data: Patient) => {
  try {
    const response = await axios.post('http://localhost:8080/api/patients', data)
    return response.data
  } catch (error) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}
export const updatePatient = async (id:string, data: Partial<Patient>) => {
  try {
    const response = await axios.put(`http://localhost:8080/api/patients/${id}`, data)
    return response.data
  } catch (error) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}
export const deletePatient = async (id:string) => {
  try {
    const response = await axios.delete(`http://localhost:8080/api/patients/${id}`)
    return response.data
  } catch (error) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}