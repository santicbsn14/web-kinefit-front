import axios from 'axios';
import { CreateAppointment, CreateAppointmentDto} from '../Utils/Types/appointmentTypes';
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
      'https://appointment-system-kinefit-1.onrender.com/api/appointments/byprofessional', 
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
    const response = await axios.get('https://appointment-system-kinefit-1.onrender.com/api/appointments')
    return response.data
  } catch (error) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}
export const updateAppointment = async (id: string, data: Partial<CreateAppointmentDto>) => {
  try {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();
    const response = await axios.put(`https://appointment-system-kinefit-1.onrender.com/api/appointments/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`, // Agrega el token al encabezado
      },
    })
    return response.data
  } catch (error) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}
export const bulkAppointments = async (data:CreateAppointmentDto[]) => {
  try {
    const auth = getAuth(); 
    const token = await auth.currentUser?.getIdToken(); 
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    const response = await axios.post('https://appointment-system-kinefit-1.onrender.com/api/appointments/bulkAppointments', data,
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
export const makeAppointmentByPatient = async (data: CreateAppointmentDto | CreateAppointment) => {
  try {
    const auth = getAuth(); 
    const token = await auth.currentUser?.getIdToken(); 
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await axios.post(
      'https://appointment-system-kinefit-1.onrender.com/api/appointments/bypatient', 
      data, 
      {
        headers: {
          Authorization: `Bearer ${token}` // Agregar el token en la cabecera
        }
      }
    );
    
    return response.data;
  } catch (error) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}
export const deleteAppointment = async (id: string) =>{
  try {
    const auth = getAuth(); 
    const token = await auth.currentUser?.getIdToken(); 
    
    if (!token) {
      throw new Error('No authentication token available');
    }
  
    const response = await axios.delete(`https://appointment-system-kinefit-1.onrender.com/api/appointments/${id}`, 
      {
        headers: {
          Authorization: `Bearer ${token}` // Agregar el token en la cabecera
        }
      })
      return response
  } catch (error) {
    const errorhandler = handleError(error)
    throw Error(errorhandler)
  }
}