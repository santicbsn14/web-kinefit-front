import axios from "axios"

export const getRoles = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/roles')
      return response.data
    } catch (error) {
      console.error(error)
    }
}