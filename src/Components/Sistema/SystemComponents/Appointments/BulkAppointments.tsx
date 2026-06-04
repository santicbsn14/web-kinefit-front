import React, { useState } from 'react'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'
import './bulkAppointments.css'
import { IProfessional, ISpecialty } from '../../../../Utils/Types/professionalTypes'
import { createAppointment } from '../../../../Services/appointmentService'

interface AppointmentInput {
  date: string
  timeFrom: string
}

interface BulkAppointmentsProps {
  professionals: IProfessional[]
  onClose: () => void
  onSuccess: () => void
}

const BulkAppointments: React.FC<BulkAppointmentsProps> = ({
  professionals,
  onClose,
  onSuccess,
}) => {
  const [selectedProfessionalId, setSelectedProfessionalId] = useState('')
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('')
  const [appointments, setAppointments] = useState<AppointmentInput[]>([
    { date: '', timeFrom: '' },
  ])
  const [loading, setLoading] = useState(false)

  const selectedProfessional = professionals.find(p => p._id === selectedProfessionalId)
  const availableSpecialties = (selectedProfessional?.specialties || []) as ISpecialty[]

  const handleAppointmentChange = (index: number, field: keyof AppointmentInput, value: string) => {
    const updated = [...appointments]
    updated[index][field] = value
    setAppointments(updated)
  }

  const addRow = () => setAppointments([...appointments, { date: '', timeFrom: '' }])

  const removeRow = (index: number) =>
    setAppointments(appointments.filter((_, i) => i !== index))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProfessionalId || !selectedSpecialtyId) {
      toast.error('Seleccioná un profesional y una especialidad.')
      return
    }

    if (appointments.some(a => !a.date || !a.timeFrom)) {
      toast.error('Completá todas las fechas y horarios.')
      return
    }

    setLoading(true)
    const results = await Promise.allSettled(
      appointments.map(a =>
        createAppointment({
          professionalId: selectedProfessionalId,
          specialtyId: selectedSpecialtyId,
          date: a.date,
          timeFrom: a.timeFrom,
        })
      )
    )

    const succeeded = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    if (succeeded > 0) toast.success(`${succeeded} turno(s) creados exitosamente.`)
    if (failed > 0) toast.error(`${failed} turno(s) no pudieron crearse.`)

    setLoading(false)
    onSuccess()
    onClose()
  }

  return (
    <div className="bulkAppointmentsContainer">
      <h2 className="bulkAppointmentsTitle">Carga Masiva de Turnos</h2>
      <form onSubmit={handleSubmit} className="bulkAppointmentsForm">

        <div className="formGroup">
          <select
            value={selectedProfessionalId}
            onChange={e => {
              setSelectedProfessionalId(e.target.value)
              setSelectedSpecialtyId('')
            }}
            required
          >
            <option value="">Seleccioná un profesional</option>
            {professionals.map(p => (
              <option key={p._id} value={p._id}>{p.userId?.name}</option>
            ))}
          </select>
        </div>

        <div className="formGroup">
          <select
            value={selectedSpecialtyId}
            onChange={e => setSelectedSpecialtyId(e.target.value)}
            required
            disabled={!selectedProfessionalId}
          >
            <option value="">Seleccioná una especialidad</option>
            {availableSpecialties.map(s => (
              <option key={s._id} value={s._id}>
                {s.name} {s.restriction?.hasRestriction ? '⏰' : ''}
              </option>
            ))}
          </select>
        </div>

        {appointments.map((appointment, index) => (
          <div key={index} className="appointmentField">
            <input
              type="date"
              value={appointment.date}
              min={dayjs().format('YYYY-MM-DD')}
              onChange={e => handleAppointmentChange(index, 'date', e.target.value)}
              required
            />
            <input
              type="time"
              value={appointment.timeFrom}
              onChange={e => handleAppointmentChange(index, 'timeFrom', e.target.value)}
              required
            />
            {appointments.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="removeButton"
              >
                Eliminar
              </button>
            )}
          </div>
        ))}

        <div className="formActions">
          <button type="button" onClick={addRow} className="addButton">
            + Agregar turno
          </button>
          <button type="submit" className="submitButton" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Turnos'}
          </button>
          <button type="button" onClick={onClose} className="cancelButton">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default BulkAppointments