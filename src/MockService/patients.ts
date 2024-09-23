import axios from "axios";

export const getPatients = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/patients')
      return response.data
    } catch (error) {
      console.error(error)
    }
  }