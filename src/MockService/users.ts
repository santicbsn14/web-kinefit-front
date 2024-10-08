import axios from "axios";
import { handleError } from "../Utils/ErrorManager/handleApiError";

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
      const response = await axios.get('http://localhost:8080/api/users')
      return response.data
    } catch (error) {
      const errorhandler = handleError(error)
      throw Error(errorhandler)
    }
}
export const getUserByEmail = async (email: string) =>{
  try {
    
    const response = await axios.get('http://localhost:8080/api/users/email', {
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
    console.log(userData)
    const response = await axios.post('http://localhost:8080/api/session/signup', userData)
    return response.data
  } catch (error: unknown) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}
export const updateUser = async (userid: string, userdata: Partial<IUser>) =>{
  try {
    const response = await axios.put(`http://localhost:8080/api/users/${userid}`, userdata)
    return response.data
  } catch (error) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}
export const deleteUserMongo = async (userid: string) =>{
  try {
    const response = await axios.delete(`http://localhost:8080/api/users/${userid}`)
    return response.data
  } catch (error) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}