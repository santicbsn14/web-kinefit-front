import React, { useState, useEffect } from 'react';
import './appointments.css';
import { getAppointments, makeAppointment, updateAppointment } from '../../../../MockService/appointments';
import { getProfessionals } from '../../../../MockService/professionals';
import { getPatients } from '../../../../MockService/patients';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BulkAppointments from './BulkAppointments';
import { CreateAppointment, CreateAppointmentDto } from '../../../../Utils/Types/appointmentTypes';


const Appointments = (): JSX.Element => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [editingAppointment, setEditingAppointment] = useState<CreateAppointment | null>(null);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [formData, setFormData] = useState({
    pacient_id: '',
    professional_id: '',
    date_time: null as Date | null,
    schedule: { week_day: 0, time_slots: { start_time: '', end_time: '' } },
    state: '',
    session_type: ''
  });

  const [professionals, setProfessionals] = useState<{ _id: string, user_id: { firstname: string, lastname:string} }[]>([]);
  const [patients, setPatients] = useState<{ _id: string, user_id: { firstname: string } }[]>([]);
  const [appointments, setAppointments] = useState<CreateAppointment[]>([]);
  
  const fetchAppointments = async () => {
    const appointmentsData = await getAppointments();
    setAppointments(appointmentsData.appointments);
  };

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
    fetchAppointments();
  }, []);

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const formatTime = (time: string): string => {
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date(2000, 0, 1, hours + 1, minutes);
    return endDate.toTimeString().slice(0, 5);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'date_time') {
      const dateValue = value ? new Date(value) : null;
      if (dateValue) {
        const weekDayNumber = dateValue.getUTCDay();
        setFormData(prevData => ({
          ...prevData,
          date_time: dateValue,
          schedule: {
            ...prevData.schedule,
            week_day: weekDayNumber
          }
        }));
      } else {
        setFormData(prevData => ({
          ...prevData,
          date_time: null,
          schedule: {
            ...prevData.schedule,
            week_day: 0
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
    if (showForm) {
      // Reset form data when closing the form
      setFormData({
        pacient_id: '',
        professional_id: '',
        date_time: null,
        schedule: { week_day: 0, time_slots: { start_time: '', end_time: '' } },
        state: '',
        session_type: ''
      });
      setIsEditing(false);
      setEditingAppointment(null);
    }
  };

  const toggleBulkForm = () => {
    setShowBulkForm(!showBulkForm);
  }; 

  const handleEdit = (appointment: CreateAppointment) => {
    setIsEditing(true);
    setEditingAppointment(appointment);
    setFormData({
      pacient_id: appointment.pacient_id._id,
      professional_id: appointment.professional_id._id,
      date_time: new Date(appointment.date_time),
      schedule: appointment.schedule,
      state: appointment.state,
      session_type: appointment.session_type
    });
    setShowForm(true);
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
        
        if (isEditing && editingAppointment) {
          if(editingAppointment._id)
          await updateAppointment(editingAppointment._id, appointmentData as unknown as CreateAppointmentDto);
        } else {
          // Create new appointment
          await makeAppointment(appointmentData as unknown as CreateAppointmentDto);
        }

        fetchAppointments();
        toast.success('El turno ha sido ' + (isEditing ? 'editado' : 'creado') + ' con éxito');
        toggleForm(); // Close the form after submission
      }
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
        <div className="addBulkAppointments" onClick={toggleBulkForm}>
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
            <th>Acciones</th> {/* Nueva columna para acciones */}
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment._id}>
              <td>{appointment._id}</td>
              <td>{formatDate(appointment.date_time)}</td>
              <td>{appointment.pacient_id?.user_id?.firstname || 'N/A'} {appointment.pacient_id?.user_id?.lastname || 'N/A'}</td>
              <td>{appointment.professional_id?.user_id?.firstname || 'N/A'}</td>
              <td>{formatTime(appointment.schedule.time_slots.start_time)}</td>
              <td>{appointment.session_type}</td>
              <td>
                <span className={`statusIndicator ${appointment.state.toLowerCase()}`}></span>
                {appointment.state}
              </td>
              <td>
                <button className='edit-button' onClick={() => handleEdit(appointment)}>
                <i className="fa-solid fa-edit"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && (
        <form onSubmit={handleSubmit} className="appointmentForm">
          <div>
            <label htmlFor="pacient_id">Paciente:</label>
            <select name="pacient_id" value={formData.pacient_id} onChange={handleInputChange}>
              <option value="">Seleccione un paciente</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.user_id.firstname} {patient.user_id.lastname}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="professional_id">Profesional:</label>
            <select name="professional_id" value={formData.professional_id} onChange={handleInputChange}>
              <option value="">Seleccione un profesional</option>
              {professionals.map((professional) => (
                <option key={professional._id} value={professional._id}>
                  {professional.user_id.firstname} {professional.user_id.lastname}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date_time">Fecha y hora:</label>
            <input
              type="datetime-local"
              name="date_time"
              value={formData.date_time ? formData.date_time.toISOString().slice(0, 16) : ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="start_time">Hora de inicio:</label>
            <input
              type="time"
              name="start_time"
              value={formData.schedule.time_slots.start_time}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="end_time">Hora de fin:</label>
            <input
              type="time"
              name="end_time"
              value={formData.schedule.time_slots.end_time}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="session_type">Tipo de sesión:</label>
            <input
              type="text"
              name="session_type"
              value={formData.session_type}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="formActions">
            <button type="submit">{isEditing ? 'Actualizar' : 'Crear'} Turno</button>
            <button type="button" onClick={toggleForm}>Cancelar</button>
          </div>
        </form>
      )}
      {showBulkForm && (
        <BulkAppointments
          patients={patients}
          professionals={professionals}
          onClose={toggleBulkForm}
          onSuccess={fetchAppointments}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default Appointments;
