import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

interface FormData {
  user_id: string;
  specialties: string[];
}
interface ConfirmDeleteModalProps {
  onClose: () => void;         // Función que no devuelve nada
  onConfirm: () => void;       // Función que no devuelve nada
  professionalName: string;    // Nombre del profesional, es un string
}

const Professionals: React.FC = () => {
  const [professionals, setProfessionals] = useState<{
    _id: string;
    user_id: { firstname: string; lastname: string; email: string; phone: string };
    specialties: string[];
  }[]>([]);
  const [users, setUsers] = useState<{ id: string; firstname: string; lastname: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [professionalToDelete, setProfessionalToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [professionalToEdit, setProfessionalToEdit] = useState<Professional | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProfessionalSchedules, setShowProfessionalSchedules] = useState(false);
  const [showDataPTS, setShowDataPTS] = useState<ProfessionalTimeSlotsBBDD | null>(null);
  const [selectedProfessionalName, setSelectedProfessionalName] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    user_id: '',
    specialties: [],
  });

  const [scheduleData, setScheduleData] = useState({
    professional_id: '',
    schedule: [{ week_day: 1, time_slots: { start_time: '', end_time: '' } }],
    state: 'Disponible',
  });

  const openScheduleModal = async (idP: string) => {
    try {
      const data: ProfessionalTimeSlotsBBDD = await getProfessionalTimeSlots(idP);
      const professional = professionals.find(p => p._id === idP);
      if (professional) {
        setSelectedProfessionalName(`${professional.user_id.firstname} ${professional.user_id.lastname}`);
      }
      setShowProfessionalSchedules(true);
      setShowDataPTS(data);
      console.log(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(errorMessage);
    }
  };

  const addScheduleSlot = useCallback(() => {
    setScheduleData(prevData => ({
      ...prevData,
      schedule: [
        ...prevData.schedule,
        { week_day: 1, time_slots: { start_time: '', end_time: '' } }, // valores predeterminados
      ],
    }));
  }, []);

  // Nueva función para eliminar un horario
  const deleteScheduleSlot = useCallback((index: number) => {
    setScheduleData(prevData => ({
      ...prevData,
      schedule: prevData.schedule.filter((_, i) => i !== index),
    }));
  }, []);

  const handleScheduleSlotChange = useCallback((index: number, field: string, value: any) => {
    setScheduleData(prevData => {
      const newSchedule = [...prevData.schedule];
      if (field === 'week_day') {
        newSchedule[index].week_day = value;
      } else {
        newSchedule[index].time_slots[field] = value;
      }
      return { ...prevData, schedule: newSchedule };
    });
  }, []);

  const specialties = useMemo(() => ['Terapia de manos', 'Rehabilitacion de rodilla', 'Osteopatia'], []);

  const fetchData = useCallback(async () => {
    try {
      const [professionalsData, usersData] = await Promise.all([getProfessionals(), getUsers()]);

      setProfessionals(professionalsData.professionals);
      setUsers(usersData.users);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los datos');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name in formData) {
      setFormData(prevData => ({ ...prevData, [name]: value }));
    }
  }, [formData]);
  const handleCheckboxChange = (especialidad: string) => {
    setFormData(prevData => {
      const updatedSpecialties = prevData.specialties.includes(especialidad)
        ? prevData.specialties.filter(item => item !== especialidad)
        : [...prevData.specialties, especialidad];
      
      return {
        ...prevData,
        specialties: updatedSpecialties
      };
    });
  };
  
  

  const toggleForm = useCallback(() => setShowForm(prev => !prev), []);
  const toggleModal = useCallback(() => setShowModal(prev => !prev), []);

  const handleScheduleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const convertTime = (timeString: string) => {
        const [hours, minutes] = timeString.replace('hs', '').trim().split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        date.setSeconds(0);
        date.setMilliseconds(0);
        const offset = date.getTimezoneOffset() * 60000; // Offset en milisegundos
        const localDate = new Date(date.getTime() - offset);

        return localDate.toISOString().slice(0, 19); // Devuelve el string sin la Z de UTC
      };

      const convertedScheduleData = {
        ...scheduleData,
        schedule: scheduleData.schedule.map(slot => ({
          ...slot,
          time_slots: {
            start_time: convertTime(slot.time_slots.start_time),
            end_time: convertTime(slot.time_slots.end_time),
          },
        })),
      };
      const professional = professionals.find(p => p._id === scheduleData.professional_id);

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
    },
    [scheduleData, professionals, toggleModal]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        await createProfessional(formData as unknown as Professional);
        toast.success('¡Creación de profesional exitosa!');
        fetchData();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(errorMessage);
      }
    },
    [formData, fetchData]
  );

  const handleEditSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if(professionalToEdit?._id)
      await updateProfessional(professionalToEdit._id,professionalToEdit);
      toast.success('¡Actualización de profesional exitosa!');
      fetchData(); // Vuelve a cargar los datos
      setShowEditForm(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(errorMessage);
    }
  }, [professionalToEdit, fetchData]);
  

  const handleEditClick = useCallback((professional: Professional) => {
    setProfessionalToEdit(professional);
    setShowEditForm(true);
  }, []);

  const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ onClose, onConfirm, professionalName }) => {
    if(!showDeleteModal) return (
      <div></div>
    )
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
  };
  

  const handleDeleteClick = useCallback((professionalId: string, professionalName: string) => {
    setProfessionalToDelete({ id: professionalId, name: professionalName });
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (professionalToDelete) {
      try {
        await deleteProfessional(professionalToDelete.id);
        toast.success('¡Profesional eliminado exitosamente!');
        fetchData();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(error);
        toast.error(errorMessage);
      }
    }
    setShowDeleteModal(false);
    setProfessionalToDelete(null);
  }, [professionalToDelete, fetchData]);

  const renderProfessionalRows = useMemo(
    () =>
      professionals.map(professional => (
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
    [professionals, handleDeleteConfirm]
  );

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

      {showForm && (
        <form onSubmit={handleSubmit} className="professionalForm">
          <label>
            Nombre Usuario:
            <select
              name="user_id"
              value={formData.user_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione un usuario</option>
              {users.map(user => (
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
                  checked={formData.specialties.includes(especialidad)} // Verifica en formData
                  onChange={() => handleCheckboxChange(especialidad)} // Cambia formData
                />
                <label htmlFor={especialidad}>{especialidad}</label>
              </div>
            ))}
          </div>
          <button type="submit">Agregar Profesional</button>
        </form>
      )}

      {showModal && (
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
                  value={scheduleData.professional_id}
                  onChange={e =>
                    setScheduleData({ ...scheduleData, professional_id: e.target.value })
                  }
                  required
                >
                  <option value="">Seleccione un profesional</option>
                  {professionals.map(professional => (
                    <option key={professional._id} value={professional._id}>
                      {professional.user_id?.firstname || `Profesional ${professional._id}`}
                    </option>
                  ))}
                </select>
              </label>

              {scheduleData.schedule.map((slot, index) => (
                <div key={index} className="scheduleSlot">
                  <label>
                    Día de la Semana:
                    <select
                      value={slot.week_day}
                      onChange={e => handleScheduleSlotChange(index, 'week_day', Number(e.target.value))}
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
                      onChange={e => handleScheduleSlotChange(index, 'start_time', e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Hora de Fin:
                    <input
                      type="time"
                      value={slot.time_slots.end_time}
                      onChange={e => handleScheduleSlotChange(index, 'end_time', e.target.value)}
                      required
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => deleteScheduleSlot(index)}
                    className="deleteScheduleButton"
                    style={{margin:'1rem'}}
                  >
                    Eliminar Horario
                  </button>
                </div>
              ))}

              <button type="button" onClick={addScheduleSlot}>
                Agregar Horario
              </button>

              <label>
                Estado:
                <select
                  value={scheduleData.state}
                  onChange={e => setScheduleData({ ...scheduleData, state: e.target.value })}
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

      {showProfessionalSchedules && showDataPTS && (
        <ProfesionalTimeSlots
          data={showDataPTS}
          nombreProfesional={selectedProfessionalName}
        />
      )}
      {showEditForm && professionalToEdit && (
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
                  checked={professionalToEdit.specialties.includes(especialidad)}
                  onChange={() => handleCheckboxChange(especialidad)}
                />
                <label htmlFor={`specialty-${especialidad}`}>{especialidad}</label>
              </div>
            ))}
          </div>
          <button type="submit">Guardar cambios</button>
        </form>
      )}

        <ConfirmDeleteModal
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        professionalName={professionalToDelete?.name || ''}
      />
      <ToastContainer />
    </div>
  );
};

export default Professionals;
