/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useCallback } from 'react';
import { ProfessionalTimeSlotsBBDD } from '../../../../Utils/Types/professionalTypes';
import './professionals.css';
import { getProfessionals, Professional, updateProfessionalTimeSlots } from '../../../../MockService/professionals';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../Contexts/authContext';

interface ProfesionalTimeSlotsProps {
  data: ProfessionalTimeSlotsBBDD | null;
  professionalName: string;
  professionals: Professional[];
  isOpen: boolean;
  onClose: ()=> boolean
}

const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const ProfesionalTimeSlots: React.FC<ProfesionalTimeSlotsProps> = ({ data, professionalName, professionals, isOpen, onClose}) => {
  const { role } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [professionalsOptions, setProfessionalsOptions] = useState<Professional[]>([]);
  const [scheduleData, setScheduleData] = useState<ProfessionalTimeSlotsBBDD>({
    professional_id: '',
    schedule: [],
    state: 'Disponible',
  });
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | undefined>(undefined);

  const fetchData = useCallback(async () => {
    try {
      const [professionalsData] = await Promise.all([getProfessionals()]);
      setProfessionalsOptions(professionalsData.professionals);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  if (!isOpen) {
    return null; 
  }
  const toggleModal = () =>{
    setShowModal(!showModal);
    console.log(showModal) 
  }

  const handleEditClick = (schedule: ProfessionalTimeSlotsBBDD) => {
    setScheduleData(schedule);
    setSelectedScheduleId(schedule._id);
    setShowModal(prevState => !prevState); // toggle the modal state
  };
  const formatDate = (dateString: string | Date) => {
    if(typeof dateString === 'string'){
    const hours = dateString.slice(11, 13);
    const minutes = dateString.slice(14, 16);
    return `${hours}:${minutes}`;
    }
  };

  const handleScheduleSlotChange = (index: number, field: string, value: unknown) => {
    const newSchedule = [...scheduleData.schedule];
    if (field === 'start_time' || field === 'end_time') {
      newSchedule[index].time_slots = {
        ...newSchedule[index].time_slots,
        [field]: value,
      };
    } else {
      //@ts-expect-error debo hostear!
      newSchedule[index][field] = value;
    }
    setScheduleData({ ...scheduleData, schedule: newSchedule });
  };

  const addScheduleSlot = () => {
    setScheduleData({
      ...scheduleData,
      schedule: [
        ...scheduleData.schedule,
        { week_day: 1, time_slots: { start_time: '13:00', end_time: '19:00' } },
      ],
    });
  };

  const deleteScheduleSlot = (index: number) => {
    const newSchedule = scheduleData.schedule.filter((_, i) => i !== index);
    setScheduleData({ ...scheduleData, schedule: newSchedule });
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleScheduleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      const convertTime = (timeString: string | Date) => {
        if (typeof timeString === 'string') {
          const [hours, minutes] = timeString.split(':');
          const date = new Date();
          date.setHours(parseInt(hours, 10));
          date.setMinutes(parseInt(minutes, 10));
          date.setSeconds(0);
          date.setMilliseconds(0);
          const offset = date.getTimezoneOffset() * 60000; 
          const localDate = new Date(date.getTime() - offset);
  
          return localDate.toISOString().slice(0, 19);
        } else {
          return timeString.toISOString().slice(0, 19);
        }
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
      if (convertedScheduleData.schedule.length === 0) {
        //@ts-expect-error es un caso especial de edicion
        delete convertedScheduleData.schedule;
      }
      console.log(convertedScheduleData)
      try {
        if (selectedScheduleId) {
          await updateProfessionalTimeSlots(selectedScheduleId, convertedScheduleData);
          toast.success('El horario fue actualizado con éxito');
        } else {
          toast.error('No se pudo identificar el horario a editar');
        }
        onClose(); 
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(errorMessage);
      }
    },
    [scheduleData, professionals, onClose, selectedScheduleId]
  );
  if (!data) {
    return <h2>No hay datos disponibles</h2>;
  }

  return (
    <>
      <h2>Horarios de {professionalName}</h2>
      <table className="profesionalTimeSlotsTable">
      <thead>
        <tr>
          <th>Día de la Semana</th>
          <th>Hora de Inicio</th>
          <th>Hora de Fin</th>
          <th>Estado</th>
          {role && typeof role === 'object' && 'name' in role &&  <th>Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {data.schedule.length > 0 ? (
          data.schedule.map((schedule, index) => (
            <tr key={`${data._id}-${index}`}>
              <td>{diasSemana[parseInt(schedule.week_day as unknown as string)]}</td>
              <td>{formatDate(schedule.time_slots.start_time)}</td>
              <td>{formatDate(schedule.time_slots.end_time)}</td>
              <td>{data.state}</td>
              {role && typeof role === 'object' && 'name' in role && role.name !== 'patient' && (
                <td>
                  <button onClick={() => handleEditClick(data)} className="edit-button">
                    <i className="fa-solid fa-edit"></i>
                  </button>
                </td>
              )}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={role && typeof role === 'object' && 'name' in role && role.name !== 'patient' ? 5 : 4}>
              No hay horarios programados
              {role && typeof role === 'object' && 'name' in role && role.name !== 'patient' && (
                <button onClick={() => handleEditClick(data)} className="edit-button">
                  <i className="fa-solid fa-edit"></i>
                </button>
              )}
            </td>
          </tr>
        )}
      </tbody>
    </table>

      {/* Modal */}
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
                  onChange={e => setScheduleData({ ...scheduleData, professional_id: e.target.value })}
                  required
                >
                  <option value="">Seleccione un profesional</option>
                  {professionalsOptions.map(professional => (
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
                      value={typeof slot.time_slots.start_time === 'string' ? slot.time_slots.start_time : slot.time_slots.start_time.toISOString().slice(11, 16)}
                      onChange={e => handleScheduleSlotChange(index, 'start_time', e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Hora de Fin:
                    <input
                      type="time"
                      value={typeof slot.time_slots.end_time === 'string' ? slot.time_slots.end_time : slot.time_slots.end_time.toISOString().slice(11, 16)}
                      onChange={e => handleScheduleSlotChange(index, 'end_time', e.target.value)}
                      required
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => deleteScheduleSlot(index)}
                    className="deleteScheduleButton"
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
                  onChange={e => setScheduleData({ ...scheduleData, state: e.target.value as 'Disponible' })}
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
    </>
  );
};

export default ProfesionalTimeSlots;
