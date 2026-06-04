import { useState, useEffect, useCallback } from 'react'
import './appointments.css'
import {  toast } from 'react-toastify'
import { useAuth } from '../../../../Contexts/authContext'
import { getAppointments, approveAppointment, rejectAppointment, cancelAppointmentBySecretary } from '../../../../Services/appointmentService'
import { getProfessionals } from '../../../../Services/professionalService'
import { IAppointment, PaginatedResult } from '../../../../Utils/Types/appointmentTypes'
import { IProfessional } from '../../../../Utils/Types/professionalTypes'
import BulkAppointments from './BulkAppointments'

const formatDate = (date: Date | string): string =>
  new Date(date).toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' })

const getPatientName = (appointment: IAppointment): string => {
  if (typeof appointment.patientId === 'object' && appointment.patientId !== null) {
    const p = appointment.patientId as any
    return p.userId?.name || 'N/A'
  }
  return 'N/A'
}


const getProfessionalName = (appointment: IAppointment): string => {
  if (typeof appointment.professionalId === 'object' && appointment.professionalId !== null) {
    return appointment.professionalId.userId?.name || 'N/A'
  }
  return 'N/A'
}

const getSpecialtyName = (appointment: IAppointment): string => {
  if (typeof appointment.specialtyId === 'object' && appointment.specialtyId !== null) {
    return appointment.specialtyId.name
  }
  return 'N/A'
}

const getPatientPhone = (appointment: IAppointment): string | null => {
  if (typeof appointment.patientId === 'object' && appointment.patientId !== null) {
    const p = appointment.patientId as any
    return p.phone || p.userId?.phone || null
  }
  return null
}

const buildWhatsAppUrl = (phone: string, appointment: IAppointment, type: 'confirm' | 'reminder'): string => {
  const patientName = getPatientName(appointment)
  const specialty = getSpecialtyName(appointment)
  const date = formatDate(appointment.date)
  const time = appointment.timeFrom

  const message = type === 'confirm'
    ? `Hola ${patientName}, tu turno de ${specialty} está confirmado para el ${date} a las ${time}hs. Cualquier consulta escribinos. ¡Te esperamos!`
    : `Hola ${patientName}, te recordamos que mañana tenés turno de ${specialty} a las ${time}hs. ¡Te esperamos!`

  return `https://wa.me/549${phone}?text=${encodeURIComponent(message)}`
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
}

const Appointments = (): JSX.Element => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<IAppointment[]>([])
  const [professionals, setProfessionals] = useState<IProfessional[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterProfessional, setFilterProfessional] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showBulkForm, setShowBulkForm] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    action: () => Promise<void>
  }>({ isOpen: false, title: '', message: '', action: async () => {} })
  const [secretaryNotes, setSecretaryNotes] = useState('')

  const fetchAppointments = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const data: PaginatedResult<IAppointment> = await getAppointments(page, 10)
      let filtered = data.docs

      if (user?.role === 'professional') {
        filtered = filtered.filter((a) => {
          const prof = a.professionalId
          if (typeof prof === 'object') return prof.userId?._id === user._id
          return false
        })
      }

      if (filterProfessional) {
        filtered = filtered.filter((a) => {
          const prof = a.professionalId
          if (typeof prof === 'object') return prof._id === filterProfessional
          return false
        })
      }

      if (filterStatus) {
        filtered = filtered.filter((a) => a.status === filterStatus)
      }

      setAppointments(filtered)
      setTotalPages(data.totalPages)
      setCurrentPage(page)
    } catch {
      toast.error('Error al cargar los turnos')
    } finally {
      setLoading(false)
    }
  }, [user, filterProfessional, filterStatus])

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const data = await getProfessionals()
        setProfessionals(data)
      } catch {
        toast.error('Error al cargar profesionales')
      }
    }
    fetchProfessionals()
    fetchAppointments(1)
  }, [fetchAppointments])

  const openConfirmModal = (title: string, message: string, action: () => Promise<void>) => {
    setConfirmModal({ isOpen: true, title, message, action })
  }

  const handleConfirm = async () => {
    try {
      await confirmModal.action()
      fetchAppointments(currentPage)
    } catch {
      toast.error('Error al realizar la acción')
    } finally {
      setConfirmModal(prev => ({ ...prev, isOpen: false }))
      setSecretaryNotes('')
    }
  }

  const handleApprove = (appointment: IAppointment) => {
    openConfirmModal(
      'Aprobar turno',
      `¿Confirmás que querés aprobar el turno de ${getPatientName(appointment)}?`,
      async () => {
        await approveAppointment(appointment._id!, secretaryNotes)
        toast.success('Turno aprobado')
      }
    )
  }

  const handleReject = (appointment: IAppointment) => {
    openConfirmModal(
      'Rechazar turno',
      `¿Confirmás que querés rechazar el turno de ${getPatientName(appointment)}?`,
      async () => {
        await rejectAppointment(appointment._id!, secretaryNotes)
        toast.success('Turno rechazado')
      }
    )
  }

  const handleCancel = (appointment: IAppointment) => {
    openConfirmModal(
      'Cancelar turno',
      `¿Confirmás que querés cancelar el turno de ${getPatientName(appointment)}?`,
      async () => {
        await cancelAppointmentBySecretary(appointment._id!, secretaryNotes)
        toast.success('Turno cancelado')
      }
    )
  }

  const handleWhatsApp = (appointment: IAppointment, type: 'confirm' | 'reminder') => {
    const phone = getPatientPhone(appointment)
    if (!phone) {
      toast.warning('Este paciente no tiene teléfono registrado')
      return
    }
    window.open(buildWhatsAppUrl(phone, appointment, type), '_blank')
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div className="appointmentsContainer">

      {/* Acciones */}
      <div className="actionsContainer">
        <select
          className="form-select"
          value={filterProfessional}
          onChange={(e) => setFilterProfessional(e.target.value)}
        >
          <option value="">Todos los profesionales</option>
          {professionals.map((p) => (
            <option key={p._id} value={p._id}>{p.userId?.name}</option>
          ))}
        </select>

        <select
          className="form-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobado</option>
          <option value="rejected">Rechazado</option>
          <option value="cancelled">Cancelado</option>
        </select>

        <div className="addBulkAppointments" onClick={() => setShowBulkForm(!showBulkForm)}>
          <i className="fa-solid fa-calendar-plus addAppointmentIcon"></i>
          <span className="addAppointmentText">Carga masiva</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-wrap">
        <table className="appointmentsTable">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Paciente</th>
              <th>Profesional</th>
              <th>Hora</th>
              <th>Especialidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={7}>No hay turnos registrados</td>
              </tr>
            ) : (
              appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>{formatDate(appointment.date)}</td>
                  <td>{getPatientName(appointment)}</td>
                  <td>{getProfessionalName(appointment)}</td>
                  <td>{appointment.timeFrom} - {appointment.timeTo}</td>
                  <td>{getSpecialtyName(appointment)}</td>
                  <td>
                    <span className={`statusIndicator ${appointment.status}`}></span>
                    {STATUS_LABELS[appointment.status] || appointment.status}
                  </td>
                  <td>
                    {appointment.status === 'pending' && (
                      <>
                        <button className="btn-ico btn-success" title="Aprobar" onClick={() => handleApprove(appointment)}>
                          <i className="fa-solid fa-check"></i>
                        </button>
                        <button className="btn-ico btn-danger" title="Rechazar" onClick={() => handleReject(appointment)}>
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </>
                    )}
                    {['pending', 'approved'].includes(appointment.status) && (
                      <button className="btn-ico btn-warning" title="Cancelar" onClick={() => handleCancel(appointment)}>
                        <i className="fa-solid fa-ban"></i>
                      </button>
                    )}
                    {appointment.status === 'approved' && (
                      <button className="btn-ico btn-whatsapp" title="WhatsApp confirmación" onClick={() => handleWhatsApp(appointment, 'confirm')}>
                        <i className="fa-brands fa-whatsapp"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="pagination">
        <button className="paginationButton" onClick={() => fetchAppointments(currentPage - 1)} disabled={currentPage === 1}>
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button className="paginationButton" onClick={() => fetchAppointments(currentPage + 1)} disabled={currentPage === totalPages}>
          Siguiente
        </button>
      </div>

      {/* Bulk form */}
      {showBulkForm && (
        <BulkAppointments
          professionals={professionals}
          onClose={() => setShowBulkForm(false)}
          onSuccess={() => fetchAppointments(currentPage)}
        />
      )}

      {/* Modal confirmación */}
      {confirmModal.isOpen && (
        <div className="modal-two">
          <div className="modalContent-two">
            <h2>{confirmModal.title}</h2>
            <p>{confirmModal.message}</p>
            <textarea
              placeholder="Notas internas (opcional)"
              value={secretaryNotes}
              onChange={(e) => setSecretaryNotes(e.target.value)}
              rows={3}
            />
            <div className="modalButtons-two">
              <button onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}>
                Cancelar
              </button>
              <button onClick={handleConfirm}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Appointments