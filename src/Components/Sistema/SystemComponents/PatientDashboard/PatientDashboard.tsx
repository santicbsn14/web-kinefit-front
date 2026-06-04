import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import 'dayjs/locale/es'
import './patientDashboard.css'
import { useAuth } from '../../../../Contexts/authContext'
import { getProfessionals } from '../../../../Services/professionalService'
import { getMyAppointments, createAppointment, cancelAppointmentByPatient } from '../../../../Services/appointmentService'
import { getSpecialties } from '../../../../Services/specialtyService'
import { IProfessional, ISpecialty } from '../../../../Utils/Types/professionalTypes'
import { IAppointment } from '../../../../Utils/Types/appointmentTypes'

dayjs.extend(utc)
dayjs.locale('es')

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
}

const PatientDashboard = () => {
  const { user } = useAuth()
  const [professionals, setProfessionals] = useState<IProfessional[]>([])
  const [specialties, setSpecialties] = useState<ISpecialty[]>([])
  const [appointments, setAppointments] = useState<IAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showProfessionals, setShowProfessionals] = useState(false)
  const [selectedProfessionalId, setSelectedProfessionalId] = useState('')
  const [filteredSpecialties, setFilteredSpecialties] = useState<ISpecialty[]>([])
  const [formData, setFormData] = useState({
    professionalId: '',
    specialtyId: '',
    date: '',
    timeFrom: '',
    notes: '',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [profs, specs, appts] = await Promise.all([
        getProfessionals(),
        getSpecialties(),
        getMyAppointments(),
      ])
      setProfessionals(profs)
      setSpecialties(specs)
      setAppointments(appts.docs)
    } catch {
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Cuando cambia el profesional seleccionado, filtrar sus especialidades
  useEffect(() => {
    if (!selectedProfessionalId) {
      setFilteredSpecialties([])
      return
    }
    const prof = professionals.find(p => p._id === selectedProfessionalId)
    if (prof) {
      setFilteredSpecialties(prof.specialties as ISpecialty[])
    }
  }, [selectedProfessionalId, professionals])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'professionalId') {
      setSelectedProfessionalId(value)
      setFormData(prev => ({ ...prev, professionalId: value, specialtyId: '' }))
    }

    // Avisar si la especialidad tiene restricciones
    if (name === 'specialtyId') {
      const spec = specialties.find(s => s._id === value)
      if (spec?.restriction.hasRestriction) {
        const days = spec.restriction.days.join(', ')
        toast.info(
          `"${spec.name}" solo se atiende los días: ${days}, de ${spec.restriction.timeFrom} a ${spec.restriction.timeTo}`,
          { autoClose: 6000 }
        )
      }
    }
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    await createAppointment({
      professionalId: formData.professionalId,
      specialtyId: formData.specialtyId,
      date: formData.date,
      timeFrom: formData.timeFrom,
      notes: formData.notes,
    })
    toast.success('¡Turno solicitado exitosamente! Quedará pendiente de aprobación.')
    fetchData()
    setTimeout(() => {
      setShowForm(false)
      setFormData({ professionalId: '', specialtyId: '', date: '', timeFrom: '', notes: '' })
    }, 1500)
  } catch (error: any) {
    toast.error(error?.response?.data?.error || 'Error al solicitar el turno')
  }
}

  const handleCancel = async (id: string) => {
    try {
      await cancelAppointmentByPatient(id)
      toast.success('Turno cancelado')
      fetchData()
    } catch {
      toast.error('Error al cancelar el turno')
    }
  }

  // Próximo turno aprobado
  const nextAppointment = appointments
    .filter(a => a.status === 'approved' && dayjs(a.date).isAfter(dayjs()))
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))[0]

  const getSpecialtyName = (a: IAppointment) =>
    typeof a.specialtyId === 'object' ? a.specialtyId.name : 'N/A'

  const getProfessionalName = (a: IAppointment) =>
    typeof a.professionalId === 'object' ? a.professionalId.userId?.name : 'N/A'

  if (loading) return <div>Cargando...</div>

  return (
    <div className="patientDashboardContainer">
      <h1 className="dashboardTitle">Panel del Paciente</h1>
      <p className="dashboardSubtitle">Bienvenido, <strong>{user?.name}</strong></p>

      {/* Próximo turno */}
      <div className={`nextAppointmentCard ${nextAppointment ? 'has-appointment' : 'no-appointment'}`}>
        <i className={`fa-solid ${nextAppointment ? 'fa-hospital-user' : 'fa-calendar-xmark'}`}></i>
        {nextAppointment
          ? <>
              Próximo turno: <strong>{dayjs(nextAppointment.date).utc().format('dddd D [de] MMMM')}</strong> a las <strong>{nextAppointment.timeFrom}</strong> — {getSpecialtyName(nextAppointment)}
            </>
          : 'No tenés turnos aprobados próximamente'
        }
      </div>

      {/* Acciones */}
      <div className="dashboardActions">
        <button
          className={`dashboardBtn ${showForm ? 'btn-cancel' : 'btn-primary'}`}
          onClick={() => setShowForm(!showForm)}
        >
          <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-calendar-plus'}`}></i>
          {showForm ? 'Cancelar' : 'Solicitar turno'}
        </button>
        <button
          className={`dashboardBtn ${showProfessionals ? 'btn-cancel' : 'btn-secondary'}`}
          onClick={() => setShowProfessionals(!showProfessionals)}
        >
          <i className="fa-solid fa-user-tie"></i>
          {showProfessionals ? 'Ocultar profesionales' : 'Ver profesionales'}
        </button>
      </div>

      {/* Formulario solicitar turno */}
      {showForm && (
        <div className="dashboardForm">
          <h2>Solicitar turno</h2>
          <div className="restrictionNotice">
            <i className="fa-solid fa-clock"></i>
            Algunas especialidades tienen días y horarios específicos de atención.
          </div>
          <form onSubmit={handleSubmit}>
            <label>Profesional:
              <select name="professionalId" value={formData.professionalId} onChange={handleInputChange} required>
                <option value="">Seleccioná un profesional</option>
                {professionals.map(p => (
                  <option key={p._id} value={p._id}>{p.userId?.name}</option>
                ))}
              </select>
            </label>

            <label>Especialidad:
              <select
                name="specialtyId"
                value={formData.specialtyId}
                onChange={handleInputChange}
                required
                disabled={!formData.professionalId}
              >
                <option value="">Seleccioná una especialidad</option>
                {filteredSpecialties.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name} {s.restriction.hasRestriction ? '⏰' : ''}
                  </option>
                ))}
              </select>
            </label>

            <label>Fecha:
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                min={dayjs().format('YYYY-MM-DD')}
              />
            </label>

            <label>Hora:
              <input
                type="time"
                name="timeFrom"
                value={formData.timeFrom}
                onChange={handleInputChange}
                required
              />
            </label>

            <label>Notas (opcional):
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Alguna observación para el profesional..."
                rows={3}
              />
            </label>

            <div className="formActions">
              <button type="submit">Solicitar turno</button>
              <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla profesionales */}
      {showProfessionals && (
        <div className="professionalsSection">
          <h2>Profesionales disponibles</h2>
          <div className="table-wrap">
            <table className="dashboardTable">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Especialidades</th>
                  <th>Horarios</th>
                </tr>
              </thead>
              <tbody>
                {professionals.map(p => (
                  <tr key={p._id}>
                    <td>{p.userId?.name}</td>
                    <td>
                      {(p.specialties as ISpecialty[]).map(s =>
                        typeof s === 'object' ? s.name : s
                      ).join(', ')}
                    </td>
                    <td>
                      {p.scheduleId?.weeklySlots?.map((slot, i) => (
                        <span key={i} className="scheduleChip">
                          {slot.day}: {slot.timeFrom}-{slot.timeTo}
                        </span>
                      )) || 'No configurado'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mis turnos */}
      <div className="myAppointmentsSection">
        <h2>Mis turnos</h2>
        {appointments.length === 0 ? (
          <p className="no-data">No tenés turnos registrados.</p>
        ) : (
          <div className="table-wrap">
            <table className="dashboardTable">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Profesional</th>
                  <th>Especialidad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a._id}>
                    <td>{dayjs(a.date).utc().format('DD/MM/YYYY')}</td>
                    <td>{a.timeFrom}</td>
                    <td>{getProfessionalName(a)}</td>
                    <td>{getSpecialtyName(a)}</td>
                    <td>
                      <span className={`statusBadge statusBadge--${a.status}`}>
                        {STATUS_LABELS[a.status]}
                      </span>
                    </td>
                    <td>
                      {['pending', 'approved'].includes(a.status) && (
                        <button
                          className="btn-ico btn-danger"
                          title="Cancelar turno"
                          onClick={() => handleCancel(a._id!)}
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

export default PatientDashboard