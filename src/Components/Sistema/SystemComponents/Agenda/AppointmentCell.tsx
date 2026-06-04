import { useState } from 'react'
import { IAppointment } from '../../../../Utils/Types/appointmentTypes'

interface Props {
  appointment: IAppointment
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
}

const AppointmentCell = ({ appointment }: Props) => {
  const [showTooltip, setShowTooltip] = useState(false)

  const patientName = typeof appointment.patientId === 'object' && appointment.patientId !== null
    ? (appointment.patientId as any).userId?.name || (appointment.patientId as any).name || 'Paciente'
    : 'Paciente'

  const professionalName = typeof appointment.professionalId === 'object' && appointment.professionalId !== null
    ? appointment.professionalId.userId?.name || 'Profesional'
    : 'Profesional'

  const specialtyName = typeof appointment.specialtyId === 'object' && appointment.specialtyId !== null
    ? appointment.specialtyId.name
    : 'Especialidad'

  const statusLabel = STATUS_LABELS[appointment.status] || appointment.status

  return (
    <div
      className={`turnoLabel turnoLabel--${appointment.status}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {patientName}
      {showTooltip && (
        <div className="turnoTooltip">
          <strong>{professionalName}</strong> — {specialtyName} ({statusLabel})
          <br />
          {appointment.timeFrom} - {appointment.timeTo}
        </div>
      )}
    </div>
  )
}

export default AppointmentCell