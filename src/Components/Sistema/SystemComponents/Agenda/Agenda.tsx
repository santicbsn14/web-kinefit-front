import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isBetween from 'dayjs/plugin/isBetween';
import './agenda.css';
import { getAppointments } from '../../../../MockService/appointments';
import { CreateAppointment } from '../../../../Utils/Types/appointmentTypes';
import { getAuth } from 'firebase/auth';
import AppointmentCell from './AppointmentCell';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekOfYear);
dayjs.extend(isBetween);

const Agenda = () => {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const hours = Array.from({ length: 12 }, (_, i) => `${8 + i}:00`);
  const [appointments, setAppointments] = useState<CreateAppointment[]>([]);
  const [professionalEmail, setProfessionalEmail] = useState<string | null>(null);

  
  const fetchAppointments = async () => {
    const appointmentsData = await getAppointments();
    setAppointments(appointmentsData.appointments);
  };

  useEffect(() => {
    fetchAppointments();
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setProfessionalEmail(user.email);
    }
  }, []);

  
  const getCurrentWeek = () => {
    const now = dayjs().utc();
    return now.week(); 
  };

  const filterAppointmentsByProfessional = (appointments: CreateAppointment[]) => {
    return appointments.filter(appointment => 
      appointment.professional_id.user_id.email === professionalEmail
    );
  };
  
  const isInCurrentWeek = (date: string) => {
    const appointmentDate = dayjs(date).utc().startOf('day'); // Ignorar las horas
    const currentWeek = getCurrentWeek();
    
    return appointmentDate.week() === currentWeek;
  };

  
  const getTurnos = (dayIndex: number, hora: string) => {
    return appointments.filter(appointment => {
      const appointmentDate = dayjs(appointment.date_time).utc();
      const appointmentWeekDay = (appointmentDate.day() + 6) % 7; // Ajuste para que lunes sea 0
  
      // Asumimos que start_time es una cadena en formato "HH:mm"
      const startTime = dayjs(appointment.schedule.time_slots.start_time, "HH:mm")
      const [hours, minutes] = hora.trim().split(":");
      const targetHour = dayjs().hour(parseInt(hours, 10)).minute(parseInt(minutes, 10));

      // Comparamos solo las horas
      const matchesHour = startTime.hour() === targetHour.hour();
  
      const matchesDay = appointmentWeekDay === dayIndex;
      const inCurrentWeek = isInCurrentWeek(appointment.date_time);

      return matchesDay && matchesHour && inCurrentWeek;
    });
  };
  

  
  const today = dayjs().utc().startOf('day');

  const turnosHoyProfesional = filterAppointmentsByProfessional(appointments).filter(appointment => {
    const appointmentDate = dayjs(appointment.date_time).utc().startOf('day');
    return appointmentDate.isSame(today);
  });

  const totalPacientesHoy = turnosHoyProfesional.length; // Contar los turnos de hoy
  const ultimoTurnoHoy = turnosHoyProfesional.length > 0
    ? dayjs(turnosHoyProfesional.reduce((latest, appointment) =>
      dayjs(latest.schedule.time_slots.end_time).isAfter(dayjs(appointment.schedule.time_slots.end_time)) ? latest : appointment
    ).schedule.time_slots.end_time).format('HH:mm') // Obtener la hora del último turno de hoy
    : 'No hay turnos'; // Si no hay turnos hoy



  return (
    <div className="mainAgenda">
      <div style={{
        width: '80%',
        marginLeft: '8rem',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <div style={{
          background: '#007bff',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '15px',
          fontWeight: 'bold'
        }}>
          <i style={{ marginRight: '5px' }} className="fa-solid fa-hospital-user"></i>
          Hoy tienes asignado un total de: {totalPacientesHoy} pacientes
        </div>
        <div style={{
          background: '#007bff',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '15px',
          fontWeight: 'bold'
        }}>
          <i className="fa-solid fa-clock" style={{ marginRight: '5px' }}></i>
          El último turno de hoy es a las: {ultimoTurnoHoy}
        </div>
      </div>

      <table className="agendaTable">
        <thead>
          <tr>
            <th>Hora</th>
            {days.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour, index) => (
            <tr key={index}>
              <td className="hourColumn">{hour}</td>
              {days.map((day, dayIndex) => {
                const turnosEnEstaHora = getTurnos(dayIndex, hour); // Obtener los turnos de ese día y hora
                return (
                  <td key={dayIndex} className="agendaCell">
                    {turnosEnEstaHora.map((appointment, index) => (
                      <AppointmentCell key={index} appointment={appointment} />
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Agenda;
