import React, { useState, useEffect, useMemo } from 'react';
import { getProfessionals, getProfessionalTimeSlots, Professional } from '../../../../MockService/professionals';
import { getPatients } from '../../../../MockService/patients';
import { getAppointments, makeAppointmentByPatient } from '../../../../MockService/appointments';
import { CreateAppointmentDto } from '../../../../Utils/Types/appointmentTypes';
import { toast, ToastContainer } from 'react-toastify';
import './patientDashboard.css'
import { ProfessionalTimeSlotsBBDD } from '../../../../Utils/Types/professionalTypes';
import ProfesionalTimeSlots from '../Professionals/ProfessionalSchedule';
import { getAuth } from 'firebase/auth';
import { getUserByEmail } from '../../../../MockService/users';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'; // Plugin opcional
import 'dayjs/locale/es'; // Carga la localización para español
dayjs.extend(localizedFormat);
dayjs.locale('es');
const PatientDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [userAppointment, setUserAppointment] = useState<Date | string | null>(null)
  const [showProfessionals, setShowProfessionals] = useState(false);
  const [showProfessionalSchedules, setShowProfessionalSchedules] = useState(false);
  const [showDataPTS, setShowDataPTS] = useState<ProfessionalTimeSlotsBBDD | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const [selectedProfessionalName, setSelectedProfessionalName] = useState<string>('');
  const [formData, setFormData] = useState({
    pacient_id: '',
    professional_id: '',
    date_time: '',
    schedule: { week_day: 0, time_slots: { start_time: '' } },
    state: '',
    session_type: ''
  });
  const email = getAuth().currentUser?.email;
  const appointmentUser = async () => {
    try {
        
        const user = await getUserByEmail(email);
        const appointment = await getAppointments();
        console.log(appointment.appointments)
        // Busca el turno correspondiente al user.id
        const userAppointment = appointment.appointments.find(
            (appt) => appt.pacient_id.user_id._id === user.id
        );

        if (userAppointment) {
            setUserAppointment(userAppointment.date_time)
        } else {
            setUserAppointment('No tienes turnos asignados')
        }
        
    } catch (error) {
        console.error('Error al obtener el usuario o los turnos:', error);
    }
}
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
    appointmentUser()
  }, []);
  const openScheduleModal = async (idP: string) => {

    if (selectedProfessionalId === idP && showProfessionalSchedules) {
      setShowProfessionalSchedules(false);
      setShowDataPTS(null);
      setSelectedProfessionalId(null);
      setSelectedProfessionalName('');
    } else {
     
      try {
        const data: ProfessionalTimeSlotsBBDD = await getProfessionalTimeSlots(idP);
        const professional = professionals.find(p => p._id === idP);
        if (professional) {
          setSelectedProfessionalName(`${professional.user_id.firstname} ${professional.user_id.lastname}`);
        }
        setShowProfessionalSchedules(true);
        setShowDataPTS(data);
        setSelectedProfessionalId(idP);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(errorMessage);
      }
    }
  };
  
  


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'date_time') {
      const date = new Date(value);
      const weekDay = date.getDay() === 0 ? 7 : date.getDay();
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
        schedule: {
          ...prevData.schedule,
          week_day: weekDay 
        },
      }));
    } else if (name === 'start_time') {
      setFormData((prevData) => ({
        ...prevData,
        schedule: {
          ...prevData.schedule,
          time_slots: { start_time: value },
        },
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };
  const toggleProfessionals = () => {
    setShowProfessionals(!showProfessionals);
  };

  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date(2000, 0, 1, hours + 1, minutes);
    return endDate.toTimeString().slice(0, 5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { date_time, schedule, pacient_id, professional_id, state, session_type } = formData;
    
    if (date_time && schedule.time_slots.start_time) {
      const startTimeParts = schedule.time_slots.start_time.split(':');
      const endTime = calculateEndTime(schedule.time_slots.start_time);
      const endTimeParts = endTime.split(':');

      const appointmentDate = new Date(date_time);
      const appointmentStartTime = new Date(appointmentDate);
      appointmentStartTime.setHours(Number(startTimeParts[0]), Number(startTimeParts[1]));

      const appointmentEndTime = new Date(appointmentDate);
      appointmentEndTime.setHours(Number(endTimeParts[0]), Number(endTimeParts[1]));

      const appointmentData: CreateAppointmentDto = {
        pacient_id,
        professional_id,
        date_time: appointmentDate.toISOString(),
        schedule: {
          week_day: schedule.week_day + 1,
          time_slots: {
            start_time: appointmentStartTime.toISOString(),
            end_time: appointmentEndTime.toISOString(),
          }
        },
        state,
        session_type
      };

      try {
        await makeAppointmentByPatient(appointmentData);
        toast.success('El turno ha sido creado con éxito');
        setShowForm(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(errorMessage);
      }
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };
  const renderProfessionalRows = useMemo(
    () =>
        
      professionals.map(professional => (
          <tr key={professional._id}>
              <td>{professional._id}</td>
              <td>{professional.user_id?.firstname || 'N/A'}</td>
              <td>{professional.user_id?.lastname || 'N/A'}</td>
              <td>{professional.specialties?.join(', ') || 'No especificado'}</td>
              <td>{professional.user_id?.email || 'No email'}</td>
              <td>{professional.user_id?.phone || 'No teléfono'}</td>
              <td>
                  <button
                      onClick={() => openScheduleModal(professional._id)}
                      className="schedule-button"
                      style={{
                          backgroundColor: selectedProfessionalId === professional._id && showProfessionalSchedules ? '#dc3545' : '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                      }}
                  >
                      <i className="fa-solid fa-calendar-check"></i>
                      {selectedProfessionalId === professional._id && showProfessionalSchedules ? ' Cerrar' : ' Abrir'}
                  </button>
              </td>
          </tr>
      )),
    [professionals]
  );
  const formattedDate = userAppointment 
    ? dayjs(userAppointment).format('dddd, D [de] MMMM [de] YYYY') 
    : 'No tienes turnos asignados';

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px', color:'rgb(151, 143, 127)' }}>Panel de Paciente</h1>
      <div style={{
        width: '80%',
        marginLeft: '8rem',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          background: '#007bff',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '15px',
          fontWeight: 'bold'
        }}>
          <i style={{ marginRight: '5px' }} className="fa-solid fa-hospital-user"></i>
          Tenes un turno asignado para el dia:{formattedDate}
        </div>
      </div>
      <button
        onClick={toggleForm}
        style={{
          backgroundColor: showForm ? '#dc3545' : '#28a745',
          color: 'white',
          padding: '10px 15px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px',
          margin:'1rem'
        }}
      >
        {showForm ? 'Ocultar Formulario' : 'Solicitar turno'}
      </button>
      <button
          onClick={toggleProfessionals}
          style={{
            backgroundColor: showProfessionals ? '#dc3545' : '#007bff',
            color: 'white',
            padding: '10px 15px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            margin:'1rem'
          }}
        >
          {showProfessionals ? 'Ocultar Profesionales' : 'Mostrar Profesionales'}
        </button>
      {showForm && (
      <div style={{ maxWidth: '500px', margin: '0 auto', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '20px' }}>Solicitar Turno</h2>
        <form onSubmit={handleSubmit}>
          {/* Paciente */}
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="pacient_id" style={{ display: 'block', marginBottom: '5px' }}>Paciente:</label>
            <select
              name="pacient_id"
              value={formData.pacient_id}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            >
              <option value="">Seleccione un paciente</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.user_id.firstname} {patient.user_id.lastname}
                </option>
              ))}
            </select>
          </div>

          {/* Profesional */}
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="professional_id" style={{ display: 'block', marginBottom: '5px' }}>Profesional:</label>
            <select
              name="professional_id"
              value={formData.professional_id}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            >
              <option value="">Seleccione un profesional</option>
              {professionals.map((professional) => (
                <option key={professional._id} value={professional._id}>
                  {professional.user_id.firstname} {professional.user_id.lastname}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="date_time" style={{ display: 'block', marginBottom: '5px' }}>Fecha:</label>
            <input
              type="date"
              name="date_time"
              value={formData.date_time}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            />
          </div>

          {/* Hora de inicio */}
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="start_time" style={{ display: 'block', marginBottom: '5px' }}>Hora de inicio:</label>
            <input
              type="time"
              name="start_time"
              value={formData.schedule.time_slots.start_time}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            />
          </div>

          {/* Tipo de sesión */}
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="session_type" style={{ display: 'block', marginBottom: '5px' }}>Tipo de sesión:</label>
            <input
              type="text"
              name="session_type"
              value={formData.session_type}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            />
          </div>

          {/* Botones */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 15px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              Crear Turno
            </button>
            <button
              type="button"
              onClick={() => setFormData({
                pacient_id: '',
                professional_id: '',
                date_time: '',
                schedule: { week_day: 0, time_slots: { start_time: '' } },
                state: '',
                session_type: ''
              })}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                padding: '10px 15px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>)}
      {showProfessionals && (
        <div style={{ overflowX: 'auto', marginLeft:'13rem' }}>
          <table className="professionalTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Especialidades</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>{renderProfessionalRows}</tbody>
          </table>
        </div>
      )}
      {showProfessionalSchedules && showDataPTS && (
        <ProfesionalTimeSlots
          data={showDataPTS}
          nombreProfesional={selectedProfessionalName}
          isOpen={showProfessionalSchedules}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default PatientDashboard;