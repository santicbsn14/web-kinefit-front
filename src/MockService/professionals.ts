import axios from "axios";
import { handleError } from "../Utils/ErrorManager/handleApiError";
import { ProfessionalTimeSlots } from "../Utils/Types/professionalTypes";
import { getAuth } from "firebase/auth";
import { IUser } from "./users";
export interface Professional {
  user_id: IUser,
  _id?: string,
  specialties: string[]
}

export const getProfessionals = async () => {
    try {
      const response = await axios.get('https://appointment-system-kinefit-1.onrender.com/api/professionals')
      return response.data
    } catch (error) {
      const errorhandler = handleError(error)
      throw Error(errorhandler)
    }
  }
export const createProfessional = async (data: Professional) => {
  try {
    const auth = getAuth(); 
    const token = await auth.currentUser?.getIdToken(); 
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    const response = await axios.post('https://appointment-system-kinefit-1.onrender.com/api/professionals', data, 
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
export const updateProfessional = async (id:string, data: Professional) => {
  try {    const auth = getAuth(); 
    const token = await auth.currentUser?.getIdToken(); 
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    const response = await axios.put(`https://appointment-system-kinefit-1.onrender.com/api/professionals/${id}`, data, 
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
export const deleteProfessional = async (id: string) => {
  try {
    const auth = getAuth(); 
      const token = await auth.currentUser?.getIdToken(); 
      
      if (!token) {
        throw new Error('No authentication token available');
      }
    const response = await axios.delete(`https://appointment-system-kinefit-1.onrender.com/api/professionals/${id}`, 
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
export const createProfessionalTimeSlots = async (data:ProfessionalTimeSlots) => {
  try {
    const auth = getAuth(); 
    const token = await auth.currentUser?.getIdToken(); 
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    const response = await axios.post(`https://appointment-system-kinefit-1.onrender.com/api/professionalTimeSlots`, data, 
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
export const getProfessionalTimeSlots = async (id:string) => {
  try {
    const auth = getAuth(); 
    const token = await auth.currentUser?.getIdToken(); 
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    const response = await axios.get(`https://appointment-system-kinefit-1.onrender.com/api/professionalTimeSlots/bypro/${id}`, 
      {
        headers: {
          Authorization: `Bearer ${token}` // Agregar el token en la cabecera
        }
      })
    if(response.data=== null){ throw new Error('Error al cargar los horarios')}
    return response.data
  } catch (error) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}
export const updateProfessionalTimeSlots = async(id:string, data:Partial<Professional>) => {
  try {
    const auth = getAuth(); 
    const token = await auth.currentUser?.getIdToken(); 
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    const response = await axios.put(`https://appointment-system-kinefit-1.onrender.com/api/professionalTimeSlots/${id}`, data, 
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