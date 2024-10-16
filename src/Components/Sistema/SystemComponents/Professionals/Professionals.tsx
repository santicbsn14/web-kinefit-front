import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import './professionals.css';
import {
  createProfessional,
  createProfessionalTimeSlots,
  deleteProfessional,
  getProfessionals,
  getProfessionalTimeSlots,
  Professional,
  updateProfessional
} from '../../../../MockService/professionals';
import { getUsers } from '../../../../MockService/users';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProfesionalTimeSlots from './ProfessionalSchedule';
import { ProfessionalTimeSlotsBBDD } from '../../../../Utils/Types/professionalTypes';
import { useAuth } from '../../../../Contexts/authContext';

interface FormData {
  user_id: string;
  specialties: string[];
}

interface ConfirmDeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
  professionalName: string;
}

interface State {
  professionals: {
    _id: string;
    user_id: { firstname: string; lastname: string; email: string; phone: string };
    specialties: string[];
  }[];
  users: { id: string; firstname: string; lastname: string, email: string }[];
  showForm: boolean;
  showDeleteModal: boolean;
  professionalToDelete: { id: string; name: string } | null;
  showModal: boolean;
  professionalToEdit: Professional | null;
  showEditForm: boolean;
  showProfessionalSchedules: boolean;
  showDataPTS: ProfessionalTimeSlotsBBDD | null;
  selectedProfessionalName: string;
  loggedInProfessional: {_id: string, firstname: string, lastname: string} | null;
  formData: FormData;
  scheduleData: {
    professional_id: string;
    schedule: { week_day: number; time_slots: { start_time: string; end_time: string } }[];
    state: string;
  };
}

type Action =
  | { type: 'SET_PROFESSIONALS'; payload: State['professionals'] }
  | { type: 'SET_USERS'; payload: State['users'] }
  | { type: 'TOGGLE_FORM' }
  | { type: 'SET_DELETE_MODAL'; payload: { show: boolean; professional?: { id: string; name: string } } }
  | { type: 'TOGGLE_MODAL' }
  | { type: 'SET_PROFESSIONAL_TO_EDIT'; payload: Professional | null }
  | { type: 'TOGGLE_EDIT_FORM' }
  | { type: 'SET_PROFESSIONAL_SCHEDULES'; payload: { show: boolean; data?: ProfessionalTimeSlotsBBDD; name?: string } }
  | { type: 'SET_LOGGED_IN_PROFESSIONAL'; payload: State['loggedInProfessional'] }
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<FormData> }
  | { type: 'UPDATE_SCHEDULE_DATA'; payload: Partial<State['scheduleData']> }
  | { type: 'ADD_SCHEDULE_SLOT' }
  | { type: 'DELETE_SCHEDULE_SLOT'; payload: number }
  | { type: 'UPDATE_SCHEDULE_SLOT'; payload: { index: number; field: string; value: any } };

const initialState: State = {
  professionals: [],
  users: [],
  showForm: false,
  showDeleteModal: false,
  professionalToDelete: null,
  showModal: false,
  professionalToEdit: null,
  showEditForm: false,
  showProfessionalSchedules: false,
  showDataPTS: null,
  selectedProfessionalName: '',
  loggedInProfessional: null,
  formData: {
    user_id: '',
    specialties: [],
  },
  scheduleData: {
    professional_id: '',
    schedule: [{ week_day: 1, time_slots: { start_time: '', end_time: '' } }],
    state: 'Disponible',
  },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PROFESSIONALS':
      return { ...state, professionals: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'TOGGLE_FORM':
      return { ...state, showForm: !state.showForm };
    case 'SET_DELETE_MODAL':
      return {
        ...state,
        showDeleteModal: action.payload.show,
        professionalToDelete: action.payload.professional || null,
      };
    case 'TOGGLE_MODAL':
      return { ...state, showModal: !state.showModal };
    case 'SET_PROFESSIONAL_TO_EDIT':
      return { ...state, professionalToEdit: action.payload };
    case 'TOGGLE_EDIT_FORM':
      return { ...state, showEditForm: !state.showEditForm };
    case 'SET_PROFESSIONAL_SCHEDULES':
      return {
        ...state,
        showProfessionalSchedules: action.payload.show,
        showDataPTS: action.payload.data || null,
        selectedProfessionalName: action.payload.name || '',
      };
    case 'SET_LOGGED_IN_PROFESSIONAL':
      return { ...state, loggedInProfessional: action.payload };
    case 'UPDATE_FORM_DATA':
      return { ...state, formData: { ...state.formData, ...action.payload } };
    case 'UPDATE_SCHEDULE_DATA':
      return { ...state, scheduleData: { ...state.scheduleData, ...action.payload } };
    case 'ADD_SCHEDULE_SLOT':
      return {
        ...state,
        scheduleData: {
          ...state.scheduleData,
          schedule: [
            ...state.scheduleData.schedule,
            { week_day: 1, time_slots: { start_time: '', end_time: '' } },
          ],
        },
      };
    case 'DELETE_SCHEDULE_SLOT':
      return {
        ...state,
        scheduleData: {
          ...state.scheduleData,
          schedule: state.scheduleData.schedule.filter((_, i) => i !== action.payload),
        },
      };
    case 'UPDATE_SCHEDULE_SLOT':
      return {
        ...state,
        scheduleData: {
          ...state.scheduleData,
          schedule: state.scheduleData.schedule.map((slot, i) =>
            i === action.payload.index
              ? {
                  ...slot,
                  ...(action.payload.field === 'week_day'
                    ? { week_day: action.payload.value }
                    : {
                        time_slots: {
                          ...slot.time_slots,
                          [action.payload.field]: action.payload.value,
                        },
                      }),
                }
              : slot
          ),
        },
      };
    default:
      return state;
  }
}

const Professionals: React.FC = () => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  const specialties = useMemo(() => [
    'Terapia de manos',
    'Kinesiologia adulto/pediatrico',
    'Terapia manual',
    'Osteopatia',
    'Cupping',
    'Neuromodulacion',
    'Electroterapia',
    'Readaptacion deportiva',
    'Puncion seca',
  ], []);

  const fetchData = useCallback(async () => {
    try {
      const [professionalsData, usersData] = await Promise.all([getProfessionals(), getUsers()]);
      dispatch({ type: 'SET_PROFESSIONALS', payload: professionalsData.professionals });
      dispatch({ type: 'SET_USERS', payload: usersData.users });
      const loggedProfessional = professionalsData.professionals.find(
        p => p.user_id.email === user?.email
      );
      if (loggedProfessional) {
        dispatch({
          type: 'SET_LOGGED_IN_PROFESSIONAL',
          payload: {
            _id: loggedProfessional._id,
            firstname: loggedProfessional.user_id.firstname,
            lastname: loggedProfessional.user_id.lastname,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los datos');
    }
  }, [user?.email]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (state.loggedInProfessional) {
      dispatch({
        type: 'UPDATE_SCHEDULE_DATA',
        payload: { professional_id: state.loggedInProfessional._id },
      });
    }
  }, [state.loggedInProfessional]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    dispatch({ type: 'UPDATE_FORM_DATA', payload: { [name]: value } });
  }, []);

  const handleCheckboxChange = useCallback((especialidad: string) => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        specialties: state.formData.specialties.includes(especialidad)
          ? state.formData.specialties.filter(item => item !== especialidad)
          : [...state.formData.specialties, especialidad],
      },
    });
  }, [state.formData.specialties]);

  const toggleForm = useCallback(() => dispatch({ type: 'TOGGLE_FORM' }), []);
  const toggleModal = useCallback(() => dispatch({ type: 'TOGGLE_MODAL' }), []);

  const handleScheduleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const convertTime = (timeString: string) => {
      const [hours, minutes] = timeString.replace('hs', '').trim().split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      date.setSeconds(0);
      date.setMilliseconds(0);
      const offset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() - offset);
      return localDate.toISOString().slice(0, 19);
    };

    const convertedScheduleData = {
      ...state.scheduleData,
      schedule: state.scheduleData.schedule.map(slot => ({
        ...slot,
        professional_id: state.scheduleData.professional_id,
        time_slots: {
          start_time: convertTime(slot.time_slots.start_time),
          end_time: convertTime(slot.time_slots.end_time),
        },
      })),
    };

    const professional = state.professionals.find(p => p._id === state.scheduleData.professional_id);

    try {
      await createProfessionalTimeSlots(convertedScheduleData);
      toast.success(
        `Se configuró el horario de ${professional?.user_id.firstname} ${professional?.user_id.lastname} con éxito`
      );
      toggleModal();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(errorMessage);
    }
  }, [state.scheduleData, state.professionals, toggleModal]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createProfessional(state.formData as unknown as Professional);
      toast.success('¡Creación de profesional exitosa!');
      fetchData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(errorMessage);
    }
  }, [state.formData, fetchData]);

  const handleEditSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (state.professionalToEdit?._id)
        await updateProfessional(state.professionalToEdit._id, state.professionalToEdit);
      toast.success('¡Actualización de profesional exitosa!');
      fetchData();
      dispatch({ type: 'TOGGLE_EDIT_FORM' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(errorMessage);
    }
  }, [state.professionalToEdit, fetchData]);

  const handleEditClick = useCallback((professional: Professional) => {
    dispatch({ type: 'SET_PROFESSIONAL_TO_EDIT', payload: professional });
    dispatch({ type: 'TOGGLE_EDIT_FORM' });
  }, []);

  const handleDeleteClick = useCallback((professionalId: string, professionalName: string) => {
    dispatch({
      type: 'SET_DELETE_MODAL',
      payload: { show: true, professional: { id: professionalId, name: professionalName } },
    });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (state.professionalToDelete) {
      try {
        await deleteProfessional(state.professionalToDelete.id);
        toast.success('¡Profesional eliminado exitosamente!');
        fetchData();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(error);
        toast.error(errorMessage);
      }
    }
    dispatch({ type: 'SET_DELETE_MODAL', payload: { show: false } });
  }, [state.professionalToDelete, fetchData]);

  const openScheduleModal = useCallback(async (idP: string) => {
    try {
      const data: ProfessionalTimeSlotsBBDD = await getProfessionalTimeSlots(idP);
      const professional = state.professionals.find(p => p._id === idP);
      if (professional) {
        dispatch({
          type: 'SET_PROFESSIONAL_SCHEDULES',
          payload: {
            show: true,
            data,
            name: `${professional.user_id.firstname} ${professional.user_id.lastname}`,
          },
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(errorMessage);
    }
  }, [state.professionals]);
  const renderProfessionalRows = useMemo(
    () =>
      state.professionals.map(professional => (
        <tr key={professional._id}>
          <td>{professional._id}</td>
          <td>{professional.user_id?.firstname || 'N/A'}</td>
          <td>{professional.user_id?.lastname || 'N/A'}</td>
          <td>{professional.specialties?.join(', ') || 'No especificado'}</td>
          <td>{professional.user_id?.email || 'No email'}</td>
          <td>{professional.user_id?.phone || 'No teléfono'}</td>
          <td>
            <button style={{margin:'2px'}} onClick={() => handleDeleteClick(professional._id, `${professional.user_id?.firstname} ${professional.user_id?.lastname}`)} className="delete-button">
              <i className="fa-solid fa-trash"></i>
            </button>
            <button style={{margin:'2px'}} onClick={() => openScheduleModal(professional._id)} className="schedule-button">
              <i className="fa-solid fa-calendar-check "></i>
            </button>
            <button style={{margin:'2px'}} onClick={() => handleEditClick(professional as unknown as Professional)} className="edit-button">
              <i className="fa-solid fa-edit"></i>
            </button>
          </td>
        </tr>
      )),
    [state.professionals, handleDeleteClick, openScheduleModal, handleEditClick]
  );

  const ConfirmDeleteModal = React.memo<ConfirmDeleteModalProps>(({ onClose, onConfirm, professionalName }) => {
    if (!state.showDeleteModal) return null;
    return (
      <div className="modal-two">
        <div className="modalContent-two">
          <h2>Confirmar eliminación</h2>
          <p>¿Estás seguro que quieres eliminar al profesional {professionalName}?</p>
          <div className="modalButtons-two">
            <button onClick={onClose}>Cancelar</button>
            <button onClick={onConfirm}>Confirmar</button>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="professionalTableContainer">
      <div className="actionsContainer">
        <div className="addPatientContainer" onClick={toggleForm}>
          <i className="fa-solid fa-user-plus addPatientIcon"></i>
          <span className="addPatientText">Agregar Profesionales</span>
        </div>
        <div className="scheduleConfigContainer" onClick={toggleModal}>
          <i className="fa-solid fa-calendar-check addScheduleIcon"></i>
          <span className="addScheduleText">Configurar disponibilidad horaria</span>
        </div>
      </div>

      <table className="professionalTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Especialidades</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>{renderProfessionalRows}</tbody>
      </table>

      {state.showForm && (
        <form onSubmit={handleSubmit} className="professionalForm">
          <label>
            Nombre Usuario:
            <select
              name="user_id"
              value={state.formData.user_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione un usuario</option>
              {state.users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstname} {user.lastname}
                </option>
              ))}
            </select>
          </label>
          <div>
            <label>Especialidad(es):</label>
            {specialties.map(especialidad => (
              <div key={especialidad}>
                <input
                  type="checkbox"
                  id={especialidad}
                  name="specialties"
                  value={especialidad}
                  checked={state.formData.specialties.includes(especialidad)}
                  onChange={() => handleCheckboxChange(especialidad)}
                />
                <label htmlFor={especialidad}>{especialidad}</label>
              </div>
            ))}
          </div>
          <button type="submit">Agregar Profesional</button>
        </form>
      )}

      {state.showModal && (
        <div className="modal">
          <div className="modalContent">
            <span className="closeModal" onClick={toggleModal}>
              &times;
            </span>
            <form onSubmit={handleScheduleSubmit} className="scheduleForm">
              <h2>Configurar Disponibilidad Horaria</h2>
              <label>
                Nombre Profesional:
                <select
                  name="professional_id"
                  value={state.scheduleData.professional_id}
                  onChange={(e) => {
                    dispatch({
                      type: 'UPDATE_SCHEDULE_DATA',
                      payload: { professional_id: e.target.value },
                    });
                  }}
                  required
                >
                  {state.loggedInProfessional ? (
                    <option value={state.loggedInProfessional._id}>
                      {`${state.loggedInProfessional.firstname} ${state.loggedInProfessional.lastname}`}
                    </option>
                  ) : (
                    <option value="">No hay profesional logueado</option>
                  )}
                </select>
              </label>

              {state.scheduleData.schedule.map((slot, index) => (
                <div key={index} className="scheduleSlot">
                  <label>
                    Día de la Semana:
                    <select
                      value={slot.week_day}
                      onChange={e => dispatch({
                        type: 'UPDATE_SCHEDULE_SLOT',
                        payload: { index, field: 'week_day', value: Number(e.target.value) },
                      })}
                    >
                      <option value={1}>Lunes</option>
                      <option value={2}>Martes</option>
                      <option value={3}>Miércoles</option>
                      <option value={4}>Jueves</option>
                      <option value={5}>Viernes</option>
                      <option value={6}>Sábado</option>
                      <option value={0}>Domingo</option>
                    </select>
                  </label>
                  <label>
                    Hora de Inicio:
                    <input
                      type="time"
                      value={slot.time_slots.start_time}
                      onChange={e => dispatch({
                        type: 'UPDATE_SCHEDULE_SLOT',
                        payload: { index, field: 'start_time', value: e.target.value },
                      })}
                      required
                    />
                  </label>
                  <label>
                    Hora de Fin:
                    <input
                      type="time"
                      value={slot.time_slots.end_time}
                      onChange={e => dispatch({
                        type: 'UPDATE_SCHEDULE_SLOT',
                        payload: { index, field: 'end_time', value: e.target.value },
                      })}
                      required
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'DELETE_SCHEDULE_SLOT', payload: index })}
                    className="deleteScheduleButton"
                    style={{ margin: '1rem' }}
                  >
                    Eliminar Horario
                  </button>
                </div>
              ))}

              <button type="button" onClick={() => dispatch({ type: 'ADD_SCHEDULE_SLOT' })}>
                Agregar Horario
              </button>

              <label>
                Estado:
                <select
                  value={state.scheduleData.state}
                  onChange={e => dispatch({
                    type: 'UPDATE_SCHEDULE_DATA',
                    payload: { state: e.target.value },
                  })}
                >
                  <option value="Disponible">Disponible</option>
                  <option value="No disponible">No disponible</option>
                  <option value="Vacaciones">Vacaciones</option>
                  <option value="Feriado">Feriado</option>
                  <option value="Licencia">Licencia</option>
                </select>
              </label>
              <button type="submit">Guardar</button>
            </form>
          </div>
        </div>
      )}

      {state.showProfessionalSchedules && state.showDataPTS && (
        <ProfesionalTimeSlots 
          professionalName={state.selectedProfessionalName} 
          data={state.showDataPTS} 
          onClose={() => dispatch({ type: 'SET_PROFESSIONAL_SCHEDULES', payload: { show: false } })}
          isOpen={state.showProfessionalSchedules} 
        />
      )}

      {state.showEditForm && state.professionalToEdit && (
        <form onSubmit={handleEditSubmit} className="editForm">
          <div>
            <label>Especialidad(es):</label>
            {specialties.map(especialidad => (
              <div key={especialidad}>
                <input
                  type="checkbox"
                  id={`specialty-${especialidad}`}
                  name="specialties"
                  value={especialidad}
                  checked={state.professionalToEdit.specialties.includes(especialidad)}
                  onChange={() => {
                    if (state.professionalToEdit) {
                      const updatedSpecialties = state.professionalToEdit.specialties.includes(especialidad)
                        ? state.professionalToEdit.specialties.filter(item => item !== especialidad)
                        : [...state.professionalToEdit.specialties, especialidad];
                      dispatch({
                        type: 'SET_PROFESSIONAL_TO_EDIT',
                        payload: { ...state.professionalToEdit, specialties: updatedSpecialties },
                      });
                    }
                  }}
                />
                <label htmlFor={`specialty-${especialidad}`}>{especialidad}</label>
              </div>
            ))}
          </div>
          <button type="submit">Guardar cambios</button>
        </form>
      )}

      <ConfirmDeleteModal
        onClose={() => dispatch({ type: 'SET_DELETE_MODAL', payload: { show: false } })}
        onConfirm={handleDeleteConfirm}
        professionalName={state.professionalToDelete?.name || ''}
      />
      <ToastContainer />
    </div>
  );
};

export default React.memo(Professionals);