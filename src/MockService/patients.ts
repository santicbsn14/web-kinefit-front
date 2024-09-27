import axios from "axios";
import { handleError } from "../Utils/ErrorManager/handleApiError";

export const getPatients = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/patients')
      return response.data
    } catch (error) {
      const errorhandler = handleError(error)
      throw Error(errorhandler)
    }
  }