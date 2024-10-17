import axios from "axios"
import { handleError } from "../Utils/ErrorManager/handleApiError"

export const getRoles = async () => {
    try {
      const response = await axios.get('https://appointment-system-kinefit-1.onrender.com/api/roles')
      return response.data
    } catch (error) {
      const errorhandler = handleError(error)
      throw Error(errorhandler)
    }
}