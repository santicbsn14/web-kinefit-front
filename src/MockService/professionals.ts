import axios from "axios";

export const getProfessionals = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/professionals')
      return response.data
    } catch (error) {
      console.error(error)
    }
  }
