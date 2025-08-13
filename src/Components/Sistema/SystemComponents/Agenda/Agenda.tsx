import { useEffect, useMemo, useState, useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isBetween from 'dayjs/plugin/isBetween';

import './agenda.css';
import { getAppointments } from '../../../../MockService/appointments';
import { CreateAppointment } from '../../../../Utils/Types/appointmentTypes';
import { getAuth } from 'firebase/auth';
import AppointmentCell from './AppointmentCell';
import { Professional } from '../../../../MockService/professionals';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekOfYear);
dayjs.extend(isBetween);

const HOUR_START = 8;   // 08:00
const HOUR_BLOCKS = 12; // 12 bloques -> 20:00

// Helpers
const toLocal = (d: string | Date | Dayjs | null | undefined): Dayjs => {
  // si no viene nada, usamos un Date inválido para que dayjs sea inválido
  const src = d ?? new Date(NaN);
  return dayjs.isDayjs(src) ? src.utc() : dayjs(src).utc();
};
// Lunes como inicio de semana (devuelve día 00:00 en UTC)
const startOfWeekMonday = (base = dayjs().utc()) => {
  const dow = (base.day() + 6) % 7; // 0=Monday..6=Sunday
  return base.startOf('day').subtract(dow, 'day');
};

// Extrae "HH:mm" o lo que venga a minutos desde 00:00
const toMinutes = (value: string | Date | Dayjs): number => {
  if (dayjs.isDayjs(value)) {
    const d = value.utc();
    return d.hour() * 60 + d.minute();
  }
  if (value instanceof Date) {
    const h = value.getUTCHours();
    const m = value.getUTCMinutes();
    return h * 60 + m;
  }
  // string: "HH:mm" o ISO
  if (/^\d{2}:\d{2}$/.test(value)) {
    const [h, m] = value.split(':').map(Number);
    return h * 60 + m;
  }
  const d = dayjs(value).utc();
  return d.hour() * 60 + d.minute();
};

const Agenda = () => {
  const [appointments, setAppointments] = useState<CreateAppointment[]>([]);
  const [professionalEmail, setProfessionalEmail] = useState<string | null>(null);

  const hours = useMemo(
    () => Array.from({ length: HOUR_BLOCKS }, (_, i) => `${String(HOUR_START + i).padStart(2, '0')}:00`),
    []
  );

  const weekDays = useMemo(() => {
    const startMonday = startOfWeekMonday();
    return Array.from({ length: 5 }, (_, i) => startMonday.add(i, 'day')); // Lunes..Viernes
  }, []);

  const fetchAppointments = useCallback(async () => {
    const appointmentsData = await getAppointments();
    setAppointments(appointmentsData.appointments);
  }, []);

  useEffect(() => {
    fetchAppointments();
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) setProfessionalEmail(user.email);
  }, [fetchAppointments]);

  const isProfessional = (id: Professional | string): id is Professional =>
    (id as Professional)?.user_id !== undefined;

  // Filtra por el profesional logueado
  const myAppointments = useMemo(() => {
    if (!professionalEmail) return [];
    return appointments.filter((a) => {
      if (!isProfessional(a.professional_id)) return false;
      return a.professional_id.user_id.email === professionalEmail;
    });
  }, [appointments, professionalEmail]);

  // KPI: hoy
  const todayUtc = dayjs().utc().startOf('day');
const kpiToday = useMemo(() => {
  const list = myAppointments.filter(
    (a) => a.date_time && toLocal(a.date_time).startOf('day').isSame(todayUtc)
  );

  const count = list.length;
  const last = count
    ? list.reduce((latest, a) =>
        toLocal(latest.schedule.time_slots.end_time).isAfter(
          toLocal(a.schedule.time_slots.end_time)
        )
          ? latest
          : a
      )
    : null;

  return {
    count,
    lastEndTime: last
      ? toLocal(last.schedule.time_slots.end_time).format('HH:mm')
      : 'No hay turnos',
  };
}, [myAppointments, todayUtc]);


  // Turnos por día/hora
const getTurnos = (dayIndex: number, hourLabel: string) => {
  const targetDate = weekDays[dayIndex];
  const [hh, mm] = hourLabel.split(':').map(Number);
  const targetMinutes = hh * 60 + mm;

  return myAppointments.filter((a) => {
    if (!a.date_time) return false;                        // <-- guarda
    const aDate = toLocal(a.date_time);
    if (!aDate.isSame(targetDate, 'day')) return false;    // mismo día

    const startMin = toMinutes(a.schedule.time_slots.start_time as unknown as string | Date | Dayjs);
    return startMin === targetMinutes;
  });
};

  return (
    <div className="mainAgenda">
      {/* KPIs */}
      <div className="agendaKpis">
        <div className="kpiCard">
          <i className="fa-solid fa-hospital-user"></i>
          Hoy tienes asignado un total de: {kpiToday.count} pacientes
        </div>
        <div className="kpiCard">
          <i className="fa-solid fa-clock"></i>
          El último turno de hoy es a las: {kpiToday.lastEndTime}
        </div>
      </div>

      {/* Grid */}
      <div className="agendaFrame">
        <table className="agendaGrid">
          <thead>
            <tr>
              <th className="stickyCol stickyHead">Hora</th>
              {weekDays.map((d, i) => (
                <th key={i} className="stickyHead">
                  <div className="dayTitle">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'][i]}
                    <span>{d.format('DD/MM')}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {hours.map((h, rIdx) => (
              <tr key={rIdx}>
                <th className="hourCell stickyCol">{h}</th>
                {weekDays.map((_, cIdx) => {
                  const turnos = getTurnos(cIdx, h);
                  return (
                    <td key={`${rIdx}-${cIdx}`}>
                      <div className="agendaCell">
                        {turnos.map((appointment, i) => (
                          <AppointmentCell key={`${appointment._id || i}`} appointment={appointment} />
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Agenda;
