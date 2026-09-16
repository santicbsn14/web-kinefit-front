import { useState, useEffect, useCallback, useRef } from 'react'
import './appointments.css'
import { toast } from 'react-toastify'
import { useAuth } from '../../../../Contexts/authContext'
import { getAppointments, approveAppointment, rejectAppointment, cancelAppointmentBySecretary } from '../../../../Services/appointmentService'
import { getProfessionals } from '../../../../Services/professionalService'
import { getSpecialties } from '../../../../Services/specialtyService'
import { IAppointment, PaginatedResult } from '../../../../Utils/Types/appointmentTypes'
import { IProfessional, ISpecialty } from '../../../../Utils/Types/professionalTypes'
import BulkAppointments from './BulkAppointments'

const PAGE_SIZE = 10
const FETCH_ALL_LIMIT = 1000 // ver nota sobre este workaround

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

  return `https://api.whatsapp.com/send/?phone=549${phone}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
}

const Appointments = (): JSX.Element => {
  const { user } = useAuth()

  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const hasLoadedOnce = useRef(false)

  const [appointments, setAppointments] = useState<IAppointment[]>([])
  const [professionals, setProfessionals] = useState<IProfessional[]>([])
  const [specialties, setSpecialties] = useState<ISpecialty[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [filterProfessional, setFilterProfessional] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSpecialty, setFilterSpecialty] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [searchPatientInput, setSearchPatientInput] = useState('')
  const [searchPatient, setSearchPatient] = useState('')

  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [showBulkForm, setShowBulkForm] = useState(false)
  const [confirmSubmitting, setConfirmSubmitting] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    action: () => Promise<void>
  }>({ isOpen: false, title: '', message: '', action: async () => {} })
  const [secretaryNotes, setSecretaryNotes] = useState('')

  // Debounce del buscador de paciente: espera 400ms sin tipear antes de disparar el fetch
  useEffect(() => {
    const timeout = setTimeout(() => setSearchPatient(searchPatientInput), 400)
    return () => clearTimeout(timeout)
  }, [searchPatientInput])

  const fetchAppointments = useCallback(async (page = 1) => {
    if (hasLoadedOnce.current) setRefreshing(true)

    try {
      const data: PaginatedResult<IAppointment> = await getAppointments(1, FETCH_ALL_LIMIT)

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

      if (filterSpecialty) {
        filtered = filtered.filter((a) => {
          const spec = a.specialtyId
          if (typeof spec === 'object') return spec._id === filterSpecialty
          return false
        })
      }

      if (filterDateFrom) {
        filtered = filtered.filter((a) => new Date(a.date) >= new Date(filterDateFrom + 'T00:00:00'))
      }

      if (filterDateTo) {
        filtered = filtered.filter((a) => new Date(a.date) <= new Date(filterDateTo + 'T23:59:59'))
      }

      if (searchPatient.trim()) {
        const term = searchPatient.trim().toLowerCase()
        filtered = filtered.filter((a) => getPatientName(a).toLowerCase().includes(term))
      }

      const sorted = [...filtered].sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
        if (dateDiff !== 0) return dateDiff
        return b.timeFrom.localeCompare(a.timeFrom)
      })

      const start = (page - 1) * PAGE_SIZE
      setAppointments(sorted.slice(start, start + PAGE_SIZE))
      setTotalPages(Math.max(1, Math.ceil(sorted.length / PAGE_SIZE)))
      setCurrentPage(page)
    } catch {
      toast.error('Error al cargar los turnos')
    } finally {
      setInitialLoading(false)
      setRefreshing(false)
      hasLoadedOnce.current = true
    }
  }, [user, filterProfessional, filterStatus, filterSpecialty, filterDateFrom, filterDateTo, searchPatient])

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [profs, specs] = await Promise.all([getProfessionals(), getSpecialties()])
        setProfessionals(profs)
        setSpecialties(specs)
      } catch {
        toast.error('Error al cargar profesionales o especialidades')
      }
    }
    fetchFilterData()
  }, [])

  useEffect(() => { fetchAppointments(1) }, [fetchAppointments])

  const handleClearFilters = () => {
    setFilterProfessional('')
    setFilterStatus('')
    setFilterSpecialty('')
    setFilterDateFrom('')
    setFilterDateTo('')
    setSearchPatientInput('')
  }

  const activeFilterCount = [
    filterProfessional, filterStatus, filterSpecialty,
    filterDateFrom, filterDateTo, searchPatientInput,
  ].filter(Boolean).length

  const openConfirmModal = (title: string, message: string, action: () => Promise<void>) => {
    setConfirmModal({ isOpen: true, title, message, action })
  }

  const handleConfirm = async () => {
    setConfirmSubmitting(true)
    try {
      await confirmModal.action()
      await fetchAppointments(currentPage)
    } catch {
      toast.error('Error al realizar la acción')
    } finally {
      setConfirmSubmitting(false)
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

  if (initialLoading) return <div className="loadingState">Cargando turnos...</div>

  return (
    <div className="appointmentsContainer">

      {/* Acciones */}
      <div className="actionsContainer">
        <button type="button" className="filtersToggleBtn" onClick={() => setShowFiltersModal(true)}>
          <i className="fa-solid fa-filter"></i> Filtros
          {activeFilterCount > 0 && <span className="filtersBadge">{activeFilterCount}</span>}
        </button>

        <div className="addBulkAppointments" onClick={() => setShowBulkForm(!showBulkForm)}>
          <i className="fa-solid fa-calendar-plus addAppointmentIcon"></i>
          <span className="addAppointmentText">Carga masiva</span>
        </div>
      </div>

      {/* Tabla */}
      <div className={`table-wrap ${refreshing ? 'is-refreshing' : ''}`}>
        {refreshing && (
          <div className="tableRefreshOverlay">
            <i className="fa-solid fa-spinner fa-spin"></i>
          </div>
        )}
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
                <td colSpan={7}>No hay turnos que coincidan con los filtros</td>
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
                        <button className="btn-ico btn-success" title="Aprobar" disabled={refreshing} onClick={() => handleApprove(appointment)}>
                          <i className="fa-solid fa-check"></i>
                        </button>
                        <button className="btn-ico btn-danger" title="Rechazar" disabled={refreshing} onClick={() => handleReject(appointment)}>
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </>
                    )}
                    {['pending', 'approved'].includes(appointment.status) && (
                      <button className="btn-ico btn-warning" title="Cancelar" disabled={refreshing} onClick={() => handleCancel(appointment)}>
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
        <button className="paginationButton" onClick={() => fetchAppointments(currentPage - 1)} disabled={refreshing || currentPage === 1}>
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button className="paginationButton" onClick={() => fetchAppointments(currentPage + 1)} disabled={refreshing || currentPage === totalPages}>
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

      {/* Modal filtros */}
      {showFiltersModal && (
        <div className="modal-two" onClick={() => setShowFiltersModal(false)}>
          <div className="modalContent-two filtersModalContent" onClick={(e) => e.stopPropagation()}>
            <h2>Filtros</h2>

            <label className="filterFieldLabel">
              Profesional
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
            </label>

            <label className="filterFieldLabel">
              Especialidad
              <select
                className="form-select"
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
              >
                <option value="">Todas las especialidades</option>
                {specialties.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </label>

            <label className="filterFieldLabel">
              Estado
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
            </label>

            <div className="filterDateRow">
              <label className="filterFieldLabel">
                Desde
                <input
                  type="date"
                  className="form-select"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                />
              </label>
              <label className="filterFieldLabel">
                Hasta
                <input
                  type="date"
                  className="form-select"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                />
              </label>
            </div>

            <label className="filterFieldLabel">
              Paciente
              <input
                type="text"
                className="form-select"
                placeholder="Buscar por nombre..."
                value={searchPatientInput}
                onChange={(e) => setSearchPatientInput(e.target.value)}
              />
            </label>

            <div className="modalButtons-two">
              <button onClick={handleClearFilters} disabled={activeFilterCount === 0}>
                Limpiar filtros
              </button>
              <button onClick={() => setShowFiltersModal(false)}>Aplicar</button>
            </div>
          </div>
        </div>
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
              disabled={confirmSubmitting}
            />
            <div className="modalButtons-two">
              <button onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} disabled={confirmSubmitting}>
                Cancelar
              </button>
              <button onClick={handleConfirm} disabled={confirmSubmitting}>
                {confirmSubmitting
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Confirmando...</>
                  : 'Confirmar'
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Appointments