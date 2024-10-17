import axios from "axios";
import { handleError } from "../Utils/ErrorManager/handleApiError";
import { getAuth } from "firebase/auth";

export interface IUser  {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  age: number;
  dni: number,
  homeAdress: string,
  phone: number,
  role:string,
  password: string;
  id?: string
  status: boolean
}

export const getUsers = async () => {
    try {
      const response = await axios.get('https://appointment-system-kinefit-1.onrender.com/api/users')
      return response.data
    } catch (error) {
      const errorhandler = handleError(error)
      throw Error(errorhandler)
    }
}
export const getUserByEmail = async (email: string) =>{
  try {
    
    const response = await axios.get('https://appointment-system-kinefit-1.onrender.com/api/users/email', {
      params: {email} 
    });

    return response.data
  } catch (error) {
    console.error(error)
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}
export const createUser = async (userData:IUser) => {
  try {
    const auth = getAuth(); 
    const token = await auth.currentUser?.getIdToken(); 
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    const response = await axios.post('https://appointment-system-kinefit-1.onrender.com/api/session/signup', userData, 
      {
        headers: {
          Authorization: `Bearer ${token}` // Agregar el token en la cabecera
        }
      })
    return response.data
  } catch (error: unknown) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}
export const updateUser = async (userid: string, userdata: Partial<IUser>) =>{
  try {
    const auth = getAuth(); 
    const token = await auth.currentUser?.getIdToken(); 
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    const response = await axios.put(`https://appointment-system-kinefit-1.onrender.com/api/users/${userid}`, userdata, 
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
export const deleteUserMongo = async (userid: string) =>{
  try {
    const auth = getAuth(); 
    const token = await auth.currentUser?.getIdToken(); 
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    const response = await axios.delete(`https://appointment-system-kinefit-1.onrender.com/api/users/${userid}`, 
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