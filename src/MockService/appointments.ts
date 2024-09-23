import axios from 'axios';
import { CreateAppointmentDto} from '../Utils/Types/appointmentTypes';

export const makeAppointment = async (appointmentData: CreateAppointmentDto) => {
  try {
    const response = await axios.post('http://localhost:8080/api/appointments/byprofessional', appointmentData);
    console.log('Respuesta:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al crear la cita:', error);
    throw error;
  }
};
export const getAppointments = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/appointments')
    return response.data
  } catch (error) {
    console.error(error)
  }
}