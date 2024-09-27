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
export const createUser = async (userData:IUser) => {
  try {
    const response = await axios.post('http://localhost:8080/api/session/signup', userData)
    return response.data
  } catch (error: unknown) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}