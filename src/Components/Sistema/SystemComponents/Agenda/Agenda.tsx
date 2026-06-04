import { useEffect, useMemo, useState, useCallback } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isBetween from 'dayjs/plugin/isBetween'

import './agenda.css'
import { getAppointments } from '../../../../Services/appointmentService'
import { IAppointment } from '../../../../Utils/Types/appointmentTypes'
import { useAuth } from '../../../../Contexts/authContext'
import AppointmentCell from './AppointmentCell'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(weekOfYear)
dayjs.extend(isBetween)

const HOUR_START = 8
const HOUR_BLOCKS = 12

const startOfWeekMonday = (base = dayjs().utc()) => {
  const dow = (base.day() + 6) % 7
  return base.startOf('day').subtract(dow, 'day')
}

const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

const Agenda = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<IAppointment[]>([])

  const hours = useMemo(
    () => Array.from({ length: HOUR_BLOCKS }, (_, i) =>
      `${String(HOUR_START + i).padStart(2, '0')}:00`
    ),
    []
  )

  const weekDays = useMemo(() => {
    const startMonday = startOfWeekMonday()
    return Array.from({ length: 5 }, (_, i) => startMonday.add(i, 'day'))
  }, [])

  const fetchAppointments = useCallback(async () => {
    try {
      // Traemos todos los turnos — para admin/secretary traemos todo
      // Para professional filtramos por su perfil
      const data = await getAppointments(1, 200)
      setAppointments(data.docs)
    } catch (error) {
      console.error('Error al cargar turnos', error)
    }
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // Filtra según el rol del usuario logueado
  const myAppointments = useMemo(() => {
    if (!user) return []

    if (user.role === 'professional') {
      return appointments.filter((a) => {
        const prof = a.professionalId
        if (typeof prof === 'object' && prof !== null) {
          return prof.userId?._id === user._id
        }
        return false
      })
    }

    // admin y secretary ven todos
    return appointments
  }, [appointments, user])

  // KPIs
  const todayUtc = dayjs().utc().startOf('day')

  const kpiToday = useMemo(() => {
    const todayList = myAppointments.filter((a) =>
      dayjs(a.date).utc().startOf('day').isSame(todayUtc)
    )

    const count = todayList.length

    const lastEndTime = count
      ? todayList.reduce((latest, a) =>
          toMinutes(a.timeTo) > toMinutes(latest.timeTo) ? a : latest
        ).timeTo
      : null

    return { count, lastEndTime }
  }, [myAppointments, todayUtc])

  // Turnos por celda
  const getTurnos = (dayIndex: number, hourLabel: string): IAppointment[] => {
    const targetDate = weekDays[dayIndex]
    const targetMinutes = toMinutes(hourLabel)

    return myAppointments.filter((a) => {
      const aDate = dayjs(a.date).utc()
      if (!aDate.isSame(targetDate, 'day')) return false
      return toMinutes(a.timeFrom) === targetMinutes
    })
  }

  return (
    <div className="mainAgenda">

      {/* KPIs */}
      <div className="agendaKpis">
        <div className="kpiCard">
          <i className="fa-solid fa-hospital-user"></i>
          Hoy tenés asignado un total de: {kpiToday.count} pacientes
        </div>
        <div className="kpiCard">
          <i className="fa-solid fa-clock"></i>
          El último turno de hoy es a las: {kpiToday.lastEndTime ?? 'No hay turnos'}
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
                  const turnos = getTurnos(cIdx, h)
                  return (
                    <td key={`${rIdx}-${cIdx}`}>
                      <div className="agendaCell">
                        {turnos.map((appointment, i) => (
                          <AppointmentCell
                            key={appointment._id || i}
                            appointment={appointment}
                          />
                        ))}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Agenda