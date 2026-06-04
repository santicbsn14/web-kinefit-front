import React, { useCallback, useEffect, useReducer } from 'react'
import './professionals.css'
import { toast } from 'react-toastify'
import { useAuth } from '../../../../Contexts/authContext'
import {
  getProfessionals,
  createProfessional,
  deleteProfessional,
  setProfessionalSchedule,
  addSpecialtyToProfessional,
  removeSpecialtyFromProfessional,
} from '../../../../Services/professionalService'
import { getSpecialties } from '../../../../Services/specialtyService'
import { IProfessional, IWeeklySlot, DayOfWeek, ISpecialty } from '../../../../Utils/Types/professionalTypes'

// ─── State ────────────────────────────────────────────────────────────────────

interface State {
  professionals: IProfessional[]
  specialties: ISpecialty[]
  loading: boolean
  showCreateForm: boolean
  showScheduleModal: boolean
  showDeleteModal: boolean
  showEditModal: boolean
  professionalToDelete: { id: string; name: string } | null
  professionalToEdit: IProfessional | null
  selectedProfessionalId: string
  createForm: {
    name: string
    email: string
    password: string
    confirmPassword: string
    specialties: string[]
  }
  scheduleSlots: IWeeklySlot[]
}

type Action =
  | { type: 'SET_PROFESSIONALS'; payload: IProfessional[] }
  | { type: 'SET_SPECIALTIES'; payload: ISpecialty[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_CREATE_FORM' }
  | { type: 'TOGGLE_SCHEDULE_MODAL' }
  | { type: 'TOGGLE_DELETE_MODAL'; payload?: { id: string; name: string } }
  | { type: 'TOGGLE_EDIT_MODAL'; payload?: IProfessional }
  | { type: 'SET_SELECTED_PROFESSIONAL'; payload: string }
  | { type: 'UPDATE_CREATE_FORM'; payload: Partial<State['createForm']> }
  | { type: 'TOGGLE_CREATE_SPECIALTY'; payload: string }
  | { type: 'TOGGLE_EDIT_SPECIALTY'; payload: string }
  | { type: 'SET_SCHEDULE_SLOTS'; payload: IWeeklySlot[] }
  | { type: 'ADD_SCHEDULE_SLOT' }
  | { type: 'DELETE_SCHEDULE_SLOT'; payload: number }
  | { type: 'UPDATE_SCHEDULE_SLOT'; payload: { index: number; field: string; value: string } }

const initialState: State = {
  professionals: [],
  specialties: [],
  loading: true,
  showCreateForm: false,
  showScheduleModal: false,
  showDeleteModal: false,
  showEditModal: false,
  professionalToDelete: null,
  professionalToEdit: null,
  selectedProfessionalId: '',
  createForm: { name: '', email: '', password: '', confirmPassword: '', specialties: [] },
  scheduleSlots: [{ day: 'monday', timeFrom: '', timeTo: '', isAvailable: true }],
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PROFESSIONALS': return { ...state, professionals: action.payload }
    case 'SET_SPECIALTIES': return { ...state, specialties: action.payload }
    case 'SET_LOADING': return { ...state, loading: action.payload }
    case 'TOGGLE_CREATE_FORM': return {
      ...state,
      showCreateForm: !state.showCreateForm,
      createForm: { name: '', email: '', password: '', confirmPassword: '', specialties: [] },
    }
    case 'TOGGLE_SCHEDULE_MODAL': return { ...state, showScheduleModal: !state.showScheduleModal }
    case 'TOGGLE_DELETE_MODAL': return {
      ...state,
      showDeleteModal: !state.showDeleteModal,
      professionalToDelete: action.payload || null,
    }
    case 'TOGGLE_EDIT_MODAL': return {
      ...state,
      showEditModal: !state.showEditModal,
      professionalToEdit: action.payload || null,
    }
    case 'SET_SELECTED_PROFESSIONAL': return { ...state, selectedProfessionalId: action.payload }
    case 'UPDATE_CREATE_FORM': return { ...state, createForm: { ...state.createForm, ...action.payload } }
    case 'TOGGLE_CREATE_SPECIALTY': {
      const specialties = state.createForm.specialties.includes(action.payload)
        ? state.createForm.specialties.filter(s => s !== action.payload)
        : [...state.createForm.specialties, action.payload]
      return { ...state, createForm: { ...state.createForm, specialties } }
    }
    case 'TOGGLE_EDIT_SPECIALTY': {
      if (!state.professionalToEdit) return state
      const current = (state.professionalToEdit.specialties as ISpecialty[]).map(s => s._id)
      const updated = current.includes(action.payload)
        ? current.filter(id => id !== action.payload)
        : [...current, action.payload]
      return {
        ...state,
        professionalToEdit: { ...state.professionalToEdit, specialties: updated as any },
      }
    }
    case 'SET_SCHEDULE_SLOTS': return { ...state, scheduleSlots: action.payload }
    case 'ADD_SCHEDULE_SLOT': return {
      ...state,
      scheduleSlots: [...state.scheduleSlots, { day: 'monday', timeFrom: '', timeTo: '', isAvailable: true }],
    }
    case 'DELETE_SCHEDULE_SLOT': return {
      ...state,
      scheduleSlots: state.scheduleSlots.filter((_, i) => i !== action.payload),
    }
    case 'UPDATE_SCHEDULE_SLOT': return {
      ...state,
      scheduleSlots: state.scheduleSlots.map((slot, i) =>
        i === action.payload.index ? { ...slot, [action.payload.field]: action.payload.value } : slot
      ),
    }
    default: return state
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: 'monday',    label: 'Lunes' },
  { value: 'tuesday',   label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday',  label: 'Jueves' },
  { value: 'friday',    label: 'Viernes' },
  { value: 'saturday',  label: 'Sábado' },
  { value: 'sunday',    label: 'Domingo' },
]

// ─── Component ────────────────────────────────────────────────────────────────

const Professionals: React.FC = () => {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(reducer, initialState)

  const fetchData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const [professionals, specialties] = await Promise.all([
        getProfessionals(),
        getSpecialties(),
      ])
      dispatch({ type: 'SET_PROFESSIONALS', payload: professionals })
      dispatch({ type: 'SET_SPECIALTIES', payload: specialties })

      if (user?.role === 'professional') {
        const myProfile = professionals.find(p => p.userId?._id === user._id)
        if (myProfile) dispatch({ type: 'SET_SELECTED_PROFESSIONAL', payload: myProfile._id })
      }
    } catch {
      toast.error('Error al cargar los datos')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const handleOpenScheduleModal = useCallback((professionalId?: string) => {
    const targetId = professionalId || state.selectedProfessionalId
    const professional = state.professionals.find(p => p._id === targetId)

    if (professional?.scheduleId?.weeklySlots?.length) {
      dispatch({ type: 'SET_SCHEDULE_SLOTS', payload: professional.scheduleId.weeklySlots })
    } else {
      dispatch({ type: 'SET_SCHEDULE_SLOTS', payload: [{ day: 'monday', timeFrom: '', timeTo: '', isAvailable: true }] })
    }

    if (targetId) dispatch({ type: 'SET_SELECTED_PROFESSIONAL', payload: targetId })
    dispatch({ type: 'TOGGLE_SCHEDULE_MODAL' })
  }, [state.professionals, state.selectedProfessionalId])

  const handleCreateSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (state.createForm.password !== state.createForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    try {
      await createProfessional({
        name: state.createForm.name,
        email: state.createForm.email,
        password: state.createForm.password,
        specialties: state.createForm.specialties,
      })
      toast.success('Profesional creado exitosamente')
      fetchData()
      setTimeout(() => dispatch({ type: 'TOGGLE_CREATE_FORM' }), 1500)
    } catch {
      toast.error('Error al crear el profesional')
    }
  }, [state.createForm, fetchData])

  const handleDeleteConfirm = useCallback(async () => {
    if (!state.professionalToDelete) return
    try {
      await deleteProfessional(state.professionalToDelete.id)
      toast.success('Profesional eliminado')
      fetchData()
    } catch {
      toast.error('Error al eliminar el profesional')
    } finally {
      dispatch({ type: 'TOGGLE_DELETE_MODAL' })
    }
  }, [state.professionalToDelete, fetchData])

  const handleScheduleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!state.selectedProfessionalId) {
      toast.error('Seleccioná un profesional')
      return
    }
    try {
      await setProfessionalSchedule(state.selectedProfessionalId, state.scheduleSlots)
          console.log('=== ANTES DEL TOAST ===')
    toast.success('Horario configurado exitosamente')
    console.log('=== DESPUES DEL TOAST ===')
      fetchData()
      setTimeout(() => dispatch({ type: 'TOGGLE_SCHEDULE_MODAL' }), 1500)
    } catch {
      toast.error('Error al configurar el horario')
    }
  }, [state.selectedProfessionalId, state.scheduleSlots, fetchData])

  const handleEditSave = useCallback(async () => {
    if (!state.professionalToEdit) return
    try {
      const specialtyIds = (state.professionalToEdit.specialties as any[]).map(s =>
        typeof s === 'string' ? s : s._id
      )
      const original = state.professionals.find(p => p._id === state.professionalToEdit!._id)
      const originalIds = (original?.specialties as ISpecialty[]).map(s => s._id)

      const toAdd = specialtyIds.filter((id: string) => !originalIds.includes(id))
      const toRemove = originalIds.filter((id: string) => !specialtyIds.includes(id))

      await Promise.all([
        ...toAdd.map((id: string) => addSpecialtyToProfessional(state.professionalToEdit!._id, id)),
        ...toRemove.map((id: string) => removeSpecialtyFromProfessional(state.professionalToEdit!._id, id)),
      ])

      toast.success('Especialidades actualizadas')
      fetchData()
      dispatch({ type: 'TOGGLE_EDIT_MODAL' })
    } catch {
      toast.error('Error al actualizar las especialidades')
    }
  }, [state.professionalToEdit, state.professionals, fetchData])

  const getSpecialtyNames = (professional: IProfessional): string => {
    if (!professional.specialties?.length) return 'Sin especialidades'
    return (professional.specialties as ISpecialty[])
      .map(s => (typeof s === 'object' ? s.name : s))
      .join(', ')
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'secretary'

  if (state.loading) return <div>Cargando...</div>

  return (
    <div className="professionalTableContainer">

      {/* Acciones */}
      <div className="actionsContainer">
        {isAdmin && (
          <div className="addPatientContainer" onClick={() => dispatch({ type: 'TOGGLE_CREATE_FORM' })}>
            <i className="fa-solid fa-user-plus addPatientIcon"></i>
            <span className="addPatientText">Agregar Profesional</span>
          </div>
        )}
        <div className="scheduleConfigContainer" onClick={() => handleOpenScheduleModal()}>
          <i className="fa-solid fa-calendar-check addScheduleIcon"></i>
          <span className="addScheduleText">Configurar horarios</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-wrap-professional">
        <table className="professionalTable">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Especialidades</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {state.professionals.length === 0 ? (
              <tr><td colSpan={4}>No hay profesionales registrados</td></tr>
            ) : (
              state.professionals.map(professional => (
                <tr key={professional._id}>
                  <td>{professional.userId?.name || 'N/A'}</td>
                  <td>{professional.userId?.email || 'N/A'}</td>
                  <td className="cell-wrap">{getSpecialtyNames(professional)}</td>
                  <td className="cell-actions">
                    <button
                      className="btn-ico btn-success"
                      title="Configurar horarios"
                      onClick={() => handleOpenScheduleModal(professional._id)}
                    >
                      <i className="fa-solid fa-calendar-check"></i>
                    </button>
                    <button
                      className="btn-ico btn-warning"
                      title="Editar especialidades"
                      onClick={() => dispatch({ type: 'TOGGLE_EDIT_MODAL', payload: professional })}
                    >
                      <i className="fa-solid fa-edit"></i>
                    </button>
                    {isAdmin && (
                      <button
                        className="btn-ico btn-danger"
                        title="Eliminar"
                        onClick={() => dispatch({
                          type: 'TOGGLE_DELETE_MODAL',
                          payload: { id: professional._id, name: professional.userId?.name || '' },
                        })}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form crear profesional */}
      {state.showCreateForm && (
        <form onSubmit={handleCreateSubmit} className="professionalForm">
          <h3>Nuevo Profesional</h3>
          <label>Nombre:
            <input type="text" value={state.createForm.name} required
              onChange={e => dispatch({ type: 'UPDATE_CREATE_FORM', payload: { name: e.target.value } })} />
          </label>
          <label>Email:
            <input type="email" value={state.createForm.email} required
              onChange={e => dispatch({ type: 'UPDATE_CREATE_FORM', payload: { email: e.target.value } })} />
          </label>
          <label>Contraseña:
            <input type="password" value={state.createForm.password} required minLength={6}
              onChange={e => dispatch({ type: 'UPDATE_CREATE_FORM', payload: { password: e.target.value } })} />
          </label>
          <label>Repetir contraseña:
            <input type="password" value={state.createForm.confirmPassword} required minLength={6}
              onChange={e => dispatch({ type: 'UPDATE_CREATE_FORM', payload: { confirmPassword: e.target.value } })} />
          </label>
          <div className="specialtiesGrid">
            <label>Especialidades:</label>
            {state.specialties.length === 0
              ? <p style={{ color: '#9ca3af', fontSize: '13px' }}>Primero creá especialidades desde el panel de Especialidades.</p>
              : state.specialties.map(s => (
                <div key={s._id} className="dayChip">
                  <input type="checkbox" id={`cs-${s._id}`}
                    checked={state.createForm.specialties.includes(s._id)}
                    onChange={() => dispatch({ type: 'TOGGLE_CREATE_SPECIALTY', payload: s._id })} />
                  <label htmlFor={`cs-${s._id}`}>{s.name}</label>
                </div>
              ))
            }
          </div>
          <div className="formActions">
            <button type="submit">Crear</button>
            <button type="button" onClick={() => dispatch({ type: 'TOGGLE_CREATE_FORM' })}>Cancelar</button>
          </div>
        </form>
      )}

      {/* Modal horarios */}
      {state.showScheduleModal && (
        <div className="modal">
          <div className="modalContent">
            <span className="closeModal" onClick={() => dispatch({ type: 'TOGGLE_SCHEDULE_MODAL' })}></span>
            <form onSubmit={handleScheduleSubmit} className="scheduleForm">
              <h2>Configurar Horarios</h2>
              <label>Profesional:
                <select
                  value={state.selectedProfessionalId}
                  onChange={e => handleOpenScheduleModal(e.target.value)}
                  required
                  disabled={user?.role === 'professional'}
                >
                  <option value="">Seleccioná un profesional</option>
                  {state.professionals.map(p => (
                    <option key={p._id} value={p._id}>{p.userId?.name}</option>
                  ))}
                </select>
              </label>

              {state.scheduleSlots.map((slot, index) => (
                <div key={index} className="scheduleSlot">
                  <label>Día:
                    <select value={slot.day}
                      onChange={e => dispatch({ type: 'UPDATE_SCHEDULE_SLOT', payload: { index, field: 'day', value: e.target.value } })}>
                      {DAY_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </label>
                  <label>Desde:
                    <input type="time" value={slot.timeFrom} required
                      onChange={e => dispatch({ type: 'UPDATE_SCHEDULE_SLOT', payload: { index, field: 'timeFrom', value: e.target.value } })} />
                  </label>
                  <label>Hasta:
                    <input type="time" value={slot.timeTo} required
                      onChange={e => dispatch({ type: 'UPDATE_SCHEDULE_SLOT', payload: { index, field: 'timeTo', value: e.target.value } })} />
                  </label>
                  <button type="button" className="deleteScheduleButton"
                    onClick={() => dispatch({ type: 'DELETE_SCHEDULE_SLOT', payload: index })}>
                    Eliminar
                  </button>
                </div>
              ))}

              <button type="button" onClick={() => dispatch({ type: 'ADD_SCHEDULE_SLOT' })}>
                + Agregar horario
              </button>
              <div className="formActions">
                <button type="submit">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal editar especialidades */}
      {state.showEditModal && state.professionalToEdit && (
        <div className="modal">
          <div className="modalContent">
            <span className="closeModal" onClick={() => dispatch({ type: 'TOGGLE_EDIT_MODAL' })}></span>
            <h2>Editar especialidades — {state.professionalToEdit.userId?.name}</h2>
            <div className="specialtiesGrid">
              {state.specialties.map(s => {
                const currentIds = (state.professionalToEdit!.specialties as any[]).map(sp =>
                  typeof sp === 'string' ? sp : sp._id
                )
                return (
                  <div key={s._id} className="dayChip">
                    <input type="checkbox" id={`edit-${s._id}`}
                      checked={currentIds.includes(s._id)}
                      onChange={() => dispatch({ type: 'TOGGLE_EDIT_SPECIALTY', payload: s._id })} />
                    <label htmlFor={`edit-${s._id}`}>{s.name}</label>
                  </div>
                )
              })}
            </div>
            <div className="formActions" style={{ marginTop: '1rem' }}>
              <button onClick={handleEditSave}>Guardar</button>
              <button onClick={() => dispatch({ type: 'TOGGLE_EDIT_MODAL' })}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar */}
      {state.showDeleteModal && (
        <div className="modal-two">
          <div className="modalContent-two">
            <h2>Confirmar eliminación</h2>
            <p>¿Estás seguro que querés eliminar a <strong>{state.professionalToDelete?.name}</strong>?</p>
            <div className="modalButtons-two">
              <button onClick={() => dispatch({ type: 'TOGGLE_DELETE_MODAL' })}>Cancelar</button>
              <button onClick={handleDeleteConfirm}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(Professionals)