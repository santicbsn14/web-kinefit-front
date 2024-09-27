import axios from "axios"
import { handleError } from "../Utils/ErrorManager/handleApiError"

export const getRoles = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/roles')
      return response.data
    } catch (error) {
      const errorhandler = handleError(error)
      throw Error(errorhandler)
    }
}