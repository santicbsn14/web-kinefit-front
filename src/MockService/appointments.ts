import axios from 'axios';
import { CreateAppointmentDto} from '../Utils/Types/appointmentTypes';
import { handleError } from '../Utils/ErrorManager/handleApiError';

import { getAuth } from 'firebase/auth'; // Importar Firebase Auth

export const makeAppointment = async (appointmentData: CreateAppointmentDto) => {
  try {
    const auth = getAuth(); // Obtener la instancia de autenticación de Firebase
    const token = await auth.currentUser?.getIdToken(); // Obtener el token del usuario autenticado

    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await axios.post(
      'http://localhost:8080/api/appointments/byprofessional', 
      appointmentData, 
      {
        headers: {
          Authorization: `Bearer ${token}` // Agregar el token en la cabecera
        }
      }
    );
    
    return response.data;
  } catch (error) {
    const errorhandler = handleError(error);
    throw Error(errorhandler);
  }
};
export const getAppointments = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/appointments')
    return response.data
  } catch (error) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}