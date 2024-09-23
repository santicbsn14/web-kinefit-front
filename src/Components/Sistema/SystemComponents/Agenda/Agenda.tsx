import { turnos } from '../Appointments/Appointments';
import './agenda.css';

const Agenda = () => {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const hours = Array.from({ length: 9 }, (_, i) => `${8 + i}:00`);

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dayNames[date.getDay()];
  };

  const normalizeHour = (hour: string) => {
    const [h, m] = hour.split(':');
    return `${parseInt(h, 10)}:${m}`;
  };

  // Función para obtener el lunes de la semana actual
  const getMonday = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajusta si el día es domingo
    return new Date(date.setDate(diff));
  };

  // Obtener el inicio y el fin de la semana actual
  const mondayOfCurrentWeek = getMonday(new Date());
  const sundayOfCurrentWeek = new Date(mondayOfCurrentWeek);
  sundayOfCurrentWeek.setDate(mondayOfCurrentWeek.getDate() + 6); // Sumar 6 días para obtener el domingo

  // Función para verificar si una fecha está dentro de la semana actual
  const isInCurrentWeek = (dateString: string) => {
    const date = new Date(dateString);
    return date >= mondayOfCurrentWeek && date <= sundayOfCurrentWeek;
  };

  // Función para obtener los turnos de un día y una hora específica, pero solo dentro de la semana actual
  const getTurnos = (dia: string, hora: string) => {
    const normalizedHour = normalizeHour(hora);
    return turnos.filter(t => {
      const turnoDay = getDayName(t.fecha);
      const turnoHour = normalizeHour(t.hora);
      return turnoDay === dia && turnoHour === normalizedHour && isInCurrentWeek(t.fecha);
    });
  };

  const today = new Date().toISOString().split('T')[0];
  const turnosHoy = turnos.filter(t => t.fecha === today && isInCurrentWeek(t.fecha));
  const totalPacientesHoy = turnosHoy.length;
  const ultimoTurnoHoy = turnosHoy.length > 0 
    ? turnosHoy.reduce((latest, turno) => 
        latest.hora > turno.hora ? latest : turno
      ).hora
    : 'No hay turnos';

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
        }}><i style={{ marginRight: '5px' }} className="fa-solid fa-hospital-user"></i>
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
              {days.map((day, i) => (
                <td key={i} className="agendaCell">
                  {getTurnos(day, hour).map((turno, index) => (
                    <div key={index} className="turnoLabel">
                      {turno.paciente}: {turno.tratamiento} ({turno.estado})
                    </div>
                  ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Agenda;
