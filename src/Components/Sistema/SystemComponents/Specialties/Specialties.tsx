import React, { useEffect, useReducer, useCallback } from 'react'
import './specialties.css'
import {  toast } from 'react-toastify'
import { getSpecialties, createSpecialty, updateSpecialty, deleteSpecialty } from '../../../../Services/specialtyService'
import { ISpecialty, DayOfWeek } from '../../../../Utils/Types/professionalTypes'

// ─── State ────────────────────────────────────────────────────────────────────

interface FormData {
  name: string
  description: string
  durationMinutes: number
  maxCapacity: number
  restriction: {
    hasRestriction: boolean
    days: DayOfWeek[]
    timeFrom: string
    timeTo: string
  }
}

interface State {
  specialties: ISpecialty[]
  loading: boolean
  showForm: boolean
  showDeleteModal: boolean
  isEditing: boolean
  specialtyToDelete: { id: string; name: string } | null
  editingId: string | null
  formData: FormData
}

type Action =
  | { type: 'SET_SPECIALTIES'; payload: ISpecialty[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_FORM' }
  | { type: 'TOGGLE_DELETE_MODAL'; payload?: { id: string; name: string } }
  | { type: 'SET_EDITING'; payload: ISpecialty }
  | { type: 'RESET_FORM' }
  | { type: 'UPDATE_FORM'; payload: Partial<FormData> }
  | { type: 'TOGGLE_DAY'; payload: DayOfWeek }
  | { type: 'TOGGLE_RESTRICTION' }

const INITIAL_FORM: FormData = {
  name: '',
  description: '',
  durationMinutes: 45,
  maxCapacity: 1,
  restriction: {
    hasRestriction: false,
    days: [],
    timeFrom: '',
    timeTo: '',
  },
}

const initialState: State = {
  specialties: [],
  loading: true,
  showForm: false,
  showDeleteModal: false,
  isEditing: false,
  specialtyToDelete: null,
  editingId: null,
  formData: INITIAL_FORM,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_SPECIALTIES': return { ...state, specialties: action.payload }
    case 'SET_LOADING': return { ...state, loading: action.payload }
    case 'TOGGLE_FORM': return { ...state, showForm: !state.showForm, isEditing: false, editingId: null, formData: INITIAL_FORM }
    case 'TOGGLE_DELETE_MODAL': return {
      ...state,
      showDeleteModal: !state.showDeleteModal,
      specialtyToDelete: action.payload || null,
    }
    case 'SET_EDITING': return {
      ...state,
      showForm: true,
      isEditing: true,
      editingId: action.payload._id,
      formData: {
        name: action.payload.name,
        description: action.payload.description || '',
        durationMinutes: action.payload.durationMinutes,
        maxCapacity: action.payload.maxCapacity,
        restriction: { ...action.payload.restriction },
      },
    }
    case 'RESET_FORM': return { ...state, showForm: false, isEditing: false, editingId: null, formData: INITIAL_FORM }
    case 'UPDATE_FORM': return { ...state, formData: { ...state.formData, ...action.payload } }
    case 'TOGGLE_DAY': {
      const days = state.formData.restriction.days.includes(action.payload)
        ? state.formData.restriction.days.filter(d => d !== action.payload)
        : [...state.formData.restriction.days, action.payload]
      return { ...state, formData: { ...state.formData, restriction: { ...state.formData.restriction, days } } }
    }
    case 'TOGGLE_RESTRICTION': return {
      ...state,
      formData: {
        ...state.formData,
        restriction: {
          ...state.formData.restriction,
          hasRestriction: !state.formData.restriction.hasRestriction,
          days: [],
          timeFrom: '',
          timeTo: '',
        },
      },
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

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles',
  thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo',
}

// ─── Component ────────────────────────────────────────────────────────────────

const Specialties: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const fetchSpecialties = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const data = await getSpecialties()
      dispatch({ type: 'SET_SPECIALTIES', payload: data })
    } catch {
      toast.error('Error al cargar las especialidades')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  useEffect(() => { fetchSpecialties() }, [fetchSpecialties])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (state.isEditing && state.editingId) {
        await updateSpecialty(state.editingId, state.formData)
        toast.success('Especialidad actualizada')
      } else {
        await createSpecialty(state.formData)
        toast.success('Especialidad creada')
      }
      dispatch({ type: 'RESET_FORM' })
      fetchSpecialties()
    } catch {
      toast.error('Error al guardar la especialidad')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!state.specialtyToDelete) return
    try {
      await deleteSpecialty(state.specialtyToDelete.id)
      toast.success('Especialidad eliminada')
      fetchSpecialties()
    } catch {
      toast.error('Error al eliminar la especialidad')
    } finally {
      dispatch({ type: 'TOGGLE_DELETE_MODAL' })
    }
  }

  if (state.loading) return <div>Cargando...</div>

  return (
    <div className="specialtiesContainer">

      {/* Acción */}
      <div className="addSpecialtyContainer" onClick={() => dispatch({ type: 'TOGGLE_FORM' })}>
        <i className="fa-solid fa-plus addSpecialtyIcon"></i>
        <span className="addSpecialtyText">
          {state.showForm ? 'Cerrar formulario' : 'Agregar especialidad'}
        </span>
      </div>

      {/* Tabla */}
      <div className="table-wrap-specialty">
        <table className="specialtyTable">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Duración</th>
              <th>Cap. máx.</th>
              <th>Restricción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {state.specialties.length === 0 ? (
              <tr><td colSpan={6}>No hay especialidades registradas</td></tr>
            ) : (
              state.specialties.map(s => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.description || '—'}</td>
                  <td>{s.durationMinutes} min</td>
                  <td>{s.maxCapacity}</td>
                  <td>
                    {s.restriction.hasRestriction ? (
                      <span className="restrictionBadge">
                        {s.restriction.days.map(d => DAY_LABELS[d]).join(', ')}
                        {' '}{s.restriction.timeFrom}–{s.restriction.timeTo}
                      </span>
                    ) : (
                      <span className="noRestriction">Sin restricción</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn-ico btn-warning"
                      title="Editar"
                      onClick={() => dispatch({ type: 'SET_EDITING', payload: s })}
                    >
                      <i className="fa-solid fa-edit"></i>
                    </button>
                    <button
                      className="btn-ico btn-danger"
                      title="Eliminar"
                      onClick={() => dispatch({ type: 'TOGGLE_DELETE_MODAL', payload: { id: s._id, name: s.name } })}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Formulario */}
      {state.showForm && (
        <form onSubmit={handleSubmit} className="specialtyForm">
          <h3>{state.isEditing ? 'Editar especialidad' : 'Nueva especialidad'}</h3>

          <label>Nombre:
            <input type="text" value={state.formData.name} required
              onChange={e => dispatch({ type: 'UPDATE_FORM', payload: { name: e.target.value } })} />
          </label>

          <label>Descripción:
            <input type="text" value={state.formData.description}
              onChange={e => dispatch({ type: 'UPDATE_FORM', payload: { description: e.target.value } })} />
          </label>

          <div className="formRow">
            <label>Duración (min):
              <input type="number" min={15} value={state.formData.durationMinutes} required
                onChange={e => dispatch({ type: 'UPDATE_FORM', payload: { durationMinutes: Number(e.target.value) } })} />
            </label>
            <label>Capacidad máxima:
              <input type="number" min={1} value={state.formData.maxCapacity} required
                onChange={e => dispatch({ type: 'UPDATE_FORM', payload: { maxCapacity: Number(e.target.value) } })} />
            </label>
          </div>

          {/* Restricción */}
          <div className="restrictionToggle">
            <input
              type="checkbox"
              id="hasRestriction"
              checked={state.formData.restriction.hasRestriction}
              onChange={() => dispatch({ type: 'TOGGLE_RESTRICTION' })}
            />
            <label htmlFor="hasRestriction">Esta especialidad tiene días/horarios específicos</label>
          </div>

          {state.formData.restriction.hasRestriction && (
            <div className="restrictionFields">
              <label>Días habilitados:</label>
              <div className="daysGrid">
                {DAY_OPTIONS.map(d => (
                  <div key={d.value} className="dayChip">
                    <input
                      type="checkbox"
                      id={`day-${d.value}`}
                      checked={state.formData.restriction.days.includes(d.value)}
                      onChange={() => dispatch({ type: 'TOGGLE_DAY', payload: d.value })}
                    />
                    <label htmlFor={`day-${d.value}`}>{d.label}</label>
                  </div>
                ))}
              </div>

              <div className="formRow">
                <label>Desde:
                  <input type="time" value={state.formData.restriction.timeFrom}
                    onChange={e => dispatch({ type: 'UPDATE_FORM', payload: { restriction: { ...state.formData.restriction, timeFrom: e.target.value } } })}
                    required={state.formData.restriction.hasRestriction} />
                </label>
                <label>Hasta:
                  <input type="time" value={state.formData.restriction.timeTo}
                    onChange={e => dispatch({ type: 'UPDATE_FORM', payload: { restriction: { ...state.formData.restriction, timeTo: e.target.value } } })}
                    required={state.formData.restriction.hasRestriction} />
                </label>
              </div>
            </div>
          )}

          <div className="formActions">
            <button type="submit">{state.isEditing ? 'Guardar cambios' : 'Crear'}</button>
            <button type="button" onClick={() => dispatch({ type: 'RESET_FORM' })}>Cancelar</button>
          </div>
        </form>
      )}

      {/* Modal eliminar */}
      {state.showDeleteModal && (
        <div className="modal-two">
          <div className="modalContent-two">
            <h2>Confirmar eliminación</h2>
            <p>¿Estás seguro que querés eliminar <strong>{state.specialtyToDelete?.name}</strong>?</p>
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

export default Specialties