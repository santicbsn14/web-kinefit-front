import axios from "axios";
import { handleError } from "../Utils/ErrorManager/handleApiError";
import { getAuth } from "firebase/auth";

export interface Patient {
  _id?: string;
  user_id:  {_id:string, firstname: string, lastname: string};
  mutual?: string;
  clinical_data: unknown[] | string;
}
export const getPatients = async () => {
    try {
      const response = await axios.get('https://appointment-system-kinefit-1.onrender.com/api/patients')
      return response.data
    } catch (error) {
      const errorhandler = handleError(error)
      throw Error(errorhandler)
    }
  }
export const createPatient = async (data: Patient) => {
  try {
    const auth = getAuth(); 
    const token = await auth.currentUser?.getIdToken(); 
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    const response = await axios.post('https://appointment-system-kinefit-1.onrender.com/api/patients', data, 
      {
        headers: {
          Authorization: `Bearer ${token}` // Agregar el token en la cabecera
        }
      })
    return response.data
  } catch (error) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}
export const updatePatient = async (id:string, data: Partial<Patient>) => {
  try {
    const auth = getAuth(); 
    const token = await auth.currentUser?.getIdToken(); 
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    const response = await axios.put(`https://appointment-system-kinefit-1.onrender.com/api/patients/${id}`, data, 
    {
      headers: {
        Authorization: `Bearer ${token}` // Agregar el token en la cabecera
      }
    })
    return response.data
  } catch (error) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}
export const deletePatient = async (id:string) => {
  try {
    const auth = getAuth(); 
    const token = await auth.currentUser?.getIdToken(); 
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    const response = await axios.delete(`https://appointment-system-kinefit-1.onrender.com/api/patients/${id}`, 
      {
        headers: {
          Authorization: `Bearer ${token}` // Agregar el token en la cabecera
        }
      })
    return response.data
  } catch (error) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}