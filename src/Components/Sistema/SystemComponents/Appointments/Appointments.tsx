import React, { useState, useEffect } from 'react';
import './appointments.css';
import { makeAppointment } from '../../../../MockService/appointments';
import { getProfessionals } from '../../../../MockService/professionals';
import { getPatients } from '../../../../MockService/patients';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export const turnos = [
  { id: '1', paciente: 'Juan Pérez', profesional: 'Dr. Ana Martínez', hora: '08:00', tratamiento: 'Consulta general', estado: 'Confirmado', fecha: '2024-09-18' },
  { id: '2', paciente: 'Laura Gómez', profesional: 'Dr. Luis Gómez', hora: '14:00', tratamiento: 'Chequeo anual', estado: 'Pendiente', fecha: '2024-09-20' },
  { id: '3', paciente: 'Carlos Ruiz', profesional: 'Dra. Elena Rodríguez', hora: '09:00', tratamiento: 'Examen dermatológico', estado: 'Cancelado', fecha: '2024-09-20' },
  { id: '4', paciente: 'Carlos Ruiz', profesional: 'Dra. Elena Rodríguez', hora: '11:00', tratamiento: 'Examen dermatológico', estado: 'Cancelado', fecha: '2024-09-18' },
];

const Appointments = (): JSX.Element => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    pacient_id: '',
    professional_id: '',
    date_time: null as Date | null, // Cambiado a tipo Date
    schedule: { week_day: 0, time_slots: { start_time: '', end_time: '' } },
    state: '',
    session_type: ''
  });

  const [professionals, setProfessionals] = useState<{ _id: string, user_id: { firstname: string } }[]>([]);
  const [patients, setPatients] = useState<{ _id: string, user_id: { firstname: string } }[]>([]);

  useEffect(() => {
    const fetchProfessionals = async () => {
      const professionalsData = await getProfessionals();
      setProfessionals(professionalsData.professionals);
    };
    const fetchPatients = async () => {
      const patientsData = await getPatients();
      setPatients(patientsData.patients);
    };
    fetchProfessionals();
    fetchPatients();
  }, []);

  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date(2000, 0, 1, hours + 1, minutes);
    return endDate.toTimeString().slice(0, 5);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'date_time') {
      // Convertir el valor a Date
      const dateValue = value ? new Date(value) : null;
  
      // Calcular el día de la semana y actualizar el estado
      if (dateValue) {
        const weekDayNumber = dateValue.getUTCDay(); // Obtiene el día de la semana (0: Domingo, 1: Lunes, ...)
        setFormData(prevData => ({
          ...prevData,
          date_time: dateValue,
          schedule: {
            ...prevData.schedule,
            week_day: weekDayNumber // Actualizar automáticamente el week_day
          }
        }));
      } else {
        setFormData(prevData => ({
          ...prevData,
          date_time: null,
          schedule: {
            ...prevData.schedule,
            week_day: 0 // O cualquier valor por defecto si dateValue es null
          }
        }));
      }
    } else if (name === 'start_time') {
      const endTime = calculateEndTime(value);
      setFormData(prevData => ({
        ...prevData,
        schedule: { 
          ...prevData.schedule, 
          time_slots: { start_time: value, end_time: endTime }
        }
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const { date_time, schedule } = formData;
      if (date_time) {
        const startTimeParts = schedule.time_slots.start_time.split(':');
        const endTimeParts = schedule.time_slots.end_time.split(':');

        const appointmentStartTime = new Date(date_time);
        appointmentStartTime.setHours(Number(startTimeParts[0]), Number(startTimeParts[1]));

        const appointmentEndTime = new Date(date_time);
        appointmentEndTime.setHours(Number(endTimeParts[0]), Number(endTimeParts[1]));


        const appointmentData = {
          ...formData,
          schedule: {
            ...schedule,
            time_slots: {
              start_time: appointmentStartTime,
              end_time: appointmentEndTime,
            }
          }
        };
        await makeAppointment(appointmentData);
      }
      toast.success('El turno ha sido creado con exito')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(errorMessage);
    }

  };

  return (
    <div className="appointmentsContainer">
      <div className="actionsContainer">
        <div className="addAppointmentContainer" onClick={toggleForm}>
          <i className="fa-solid fa-calendar-plus addAppointmentIcon"></i>
          <span className="addAppointmentText">Agregar turno</span>
        </div>
        <div className="addBulkAppointments">
          <i className="fa-solid fa-calendar-plus addAppointmentIcon"></i>
          <span className="addAppointmentText">Carga Masiva de turnos</span>
        </div>
      </div>
      <table className="appointmentsTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Paciente</th>
            <th>Profesional</th>
            <th>Hora</th>
            <th>Tratamiento</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {turnos.map((turno) => (
            <tr key={turno.id}>
              <td>{turno.id}</td>
              <td>{turno.fecha}</td>
              <td>{turno.paciente}</td>
              <td>{turno.profesional}</td>
              <td>{turno.hora}</td>
              <td>{turno.tratamiento}</td>
              <td>
                <span className={`statusIndicator ${turno.estado.toLowerCase()}`}></span>
                {turno.estado}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <form onSubmit={handleSubmit} className="appointmentForm">
          <select
            name="professional_id"
            value={formData.professional_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Seleccione un profesional</option>
            {professionals.map(pro => (
              <option key={pro._id} value={pro._id}>
                {pro.user_id?.firstname || `Profesional ${pro._id}`}
              </option>
            ))}
          </select>

          <select
            name="pacient_id"
            value={formData.pacient_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Seleccione un paciente</option>
            {patients.map(patient => (
              <option key={patient._id} value={patient._id}>
                {patient.user_id?.firstname ||` Paciente ${patient._id}`}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="date_time"
            value={formData.date_time ? formData.date_time.toISOString().slice(0, 10) : ''}
            onChange={handleInputChange}
            required
          />
          <input
            type="time"
            name="start_time"
            value={formData.schedule.time_slots.start_time}
            onChange={handleInputChange}
            required
          />
          <select
            name="session_type"
            value={formData.session_type}
            onChange={handleInputChange}
            required
          >
            <option value="">Seleccione tipo de sesión</option>
            <option value="Consulta general">Consulta general</option>
            <option value="Chequeo anual">Chequeo anual</option>
            <option value="Examen dermatológico">Examen dermatológico</option>
          </select>
          <button type="submit">Guardar</button>
        </form>
      )}
      <ToastContainer />
    </div>
  );
};

export default Appointments;
