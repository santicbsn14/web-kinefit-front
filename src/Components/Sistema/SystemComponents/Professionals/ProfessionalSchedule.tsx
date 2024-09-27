import React from 'react';
import { ProfessionalTimeSlotsBBDD } from '../../../../Utils/Types/professionalTypes';
import './professionals.css';

interface ProfesionalTimeSlotsProps {
  data: ProfessionalTimeSlotsBBDD | null;
  nombreProfesional: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const localDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
  return localDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const ProfesionalTimeSlots: React.FC<ProfesionalTimeSlotsProps> = ({data, nombreProfesional}) => {
  if (!data) {
    return <div>No hay datos disponibles</div>; 
  }
  
  return (
    <>
      <h2>Horarios de {nombreProfesional}</h2>
      <table className="profesionalTimeSlotsTable">
        <thead>
          <tr>
            <th>Día de la Semana</th>
            <th>Hora de Inicio</th>
            <th>Hora de Fin</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.schedule.map((schedule, index) => (
            <tr key={`${data._id}-${index}`}>
              <td className="timeSlotCell">{diasSemana[parseInt(schedule.week_day)]}</td>
              <td className="timeSlotCell">{formatDate(schedule.time_slots.start_time)}</td>
              <td className="timeSlotCell">{formatDate(schedule.time_slots.end_time)}</td>
              <td className="timeSlotCell">{data.state}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default ProfesionalTimeSlots;