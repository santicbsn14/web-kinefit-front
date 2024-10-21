/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useEffect } from 'react';
import './appointments.css';
import { deleteAppointment, getAppointments, makeAppointment, updateAppointment } from '../../../../MockService/appointments';
import { getProfessionals, Professional } from '../../../../MockService/professionals';
import { getPatients, Patient } from '../../../../MockService/patients';
import { ToastContainer, toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faWhatsapp} from  '@fortawesome/free-brands-svg-icons'
import 'react-toastify/dist/ReactToastify.css';
import BulkAppointments from './BulkAppointments';
import { CreateAppointment, CreateAppointmentDto } from '../../../../Utils/Types/appointmentTypes';
import { sendWhatsAppMessageConfirmAppointment } from '../../../../MockService/messages';
import axios from 'axios';
import { DaySchedule } from '../../../../Utils/Types/professionalTypes';

interface ConfirmDeleteModalProps {
  isOpen:boolean;
  onClose: () => void;         // Función que no devuelve nada
  onConfirm: () => void;       // Función que no devuelve nada
  patientName: string;    // Nombre del profesional, es un string
}
const Appointments = (): JSX.Element => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<{ id: string; name: string } | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<CreateAppointment | null>(null);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    pacient_id: '',
    professional_id: '',
    date_time: null as Date | null,
    schedule: { week_day: 0, time_slots: { start_time: '', end_time: '' } },
    state: '',
    session_type: ''
  });
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [appointmentsPerPage] = useState(10); // Número de citas por página

  const [professionals, setProfessionals] = useState<{ _id: string, user_id: { firstname: string, lastname:string, phone: string} }[]>([]);
  const [patients, setPatients] = useState<{ _id: string, user_id: { firstname: string, lastname:string, phone: string } }[]>([]);
  const [appointments, setAppointments] = useState<CreateAppointment[]>([]);
  

  const fetchAppointments = React.useCallback(async () => {
    setLoading(true); // Inicia la carga
    try {
      const appointmentsData = await getAppointments();
      setAppointments(appointmentsData.appointments);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false); // Finaliza la carga
    }
  }, []); // Aquí puedes añadir dependencias si las hay

  const handleDeleteConfirm = React.useCallback(async () => {
    if (appointmentToDelete) {
      try {
        await deleteAppointment(appointmentToDelete.id);
        toast.success('¡El turno ha sido eliminado exitosamente!');
        fetchAppointments();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(errorMessage);
      }
    }
    setShowDeleteModal(false);
    setAppointmentToDelete(null);
  }, [appointmentToDelete, fetchAppointments]);

  useEffect(() => {
    const fetchProfessionals = async () => {
      const professionalsData = await getProfessionals();
      setProfessionals(professionalsData.professionals);
    };
    const fetchPatients = async () => {
      const patientsData = await getPatients();
      setPatients(patientsData.patients);
    };

    // Fetch all data concurrently
    const fetchData = async () => {
      await Promise.all([fetchProfessionals(), fetchPatients(), fetchAppointments()]);
      setLoading(false); // Finaliza la carga después de todas las recuperaciones
    };

    fetchData();
  }, []);
  if(loading) return(
    <div>
      Cargando...
    </div>
  )
  const uploadImageToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'upload_test');
    formData.append('cloud_name', 'ds8ilvysp');
    
    try {
      const response = await axios.post('https://api.cloudinary.com/v1_1/ds8ilvysp/image/upload', formData);
      return response.data.secure_url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(error);
      toast.error(errorMessage);
    }
  };
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const formatTime = (time: string): string => {
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const openPhotoOrder = (url:string) =>{
    window.open(url, '_blank');
  }
  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date(2000, 0, 1, hours + 1, minutes);
    return endDate.toTimeString().slice(0, 5);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
  
    if (name === 'date_time') {
      const dateValue = value ? new Date(`${value}T00:00:00`) : null; // Forzamos la hora a medianoche
      if (dateValue) {
        const weekDayNumber = dateValue.getUTCDay();
        setFormData(prevData => ({
          ...prevData,
          date_time: dateValue,
          schedule: {
            ...prevData.schedule,
            week_day: weekDayNumber
          }
        }));
      } else {
        setFormData(prevData => ({
          ...prevData,
          date_time: null,
          schedule: {
            ...prevData.schedule,
            week_day: 0
          }
        }));
      }
    } else if (name === 'start_time') {
      const endTime = calculateEndTime(value);
      setFormData(prevData => ({
        ...prevData,
        schedule: { 
          ...prevData.schedule, 
          time_slots: { start_time: value, end_time: endTime }
        }
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  const isPatient = (id: Patient | string | null): id is Patient => {
    // Verifica si 'id' es null o undefined antes de hacer la comprobación
    if (id === null || id === undefined) {
        return false; // Devuelve false si 'id' es null o undefined
    }
    
    // Si no es null, intenta acceder a user_id
    return (id as Patient).user_id !== undefined;
};

const isProfessional = (id: Professional | string | null): id is Professional => {
    if (id === null || id === undefined) {
        return false; // Devuelve false si 'id' es null o undefined
    }
    
    return (id as Professional).user_id !== undefined;
};
  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      // Reset form data when closing the form
      setFormData({
        pacient_id: '',
        professional_id: '',
        date_time: null,
        schedule: { week_day: 0, time_slots: { start_time: '', end_time: '' } },
        state: '',
        session_type: ''
      });
      setIsEditing(false);
      setEditingAppointment(null);
    }
  };

  const toggleBulkForm = () => {
    setShowBulkForm(!showBulkForm);
  }; 

  const handleEdit = (appointment: CreateAppointment) => {
    setIsEditing(true);
    setEditingAppointment(appointment);
  
    setFormData({
      //@ts-expect-error debo hostear!
      pacient_id: typeof appointment.pacient_id !== 'string' ? appointment.pacient_id._id : '' , 
      //@ts-expect-error debo hostear!
      professional_id: typeof appointment.professional_id !== 'string' ? appointment.professional_id._id : '', 
      date_time: appointment.date_time ? new Date(appointment.date_time) : null, 
      schedule: appointment.schedule as unknown as  DaySchedule,
      state: appointment.state as string,
      session_type: appointment.session_type
    });
  
    setShowForm(true);
  };
  
  const handleDeleteClick = (appointmentId: string, patientName: string) => {
    setAppointmentToDelete({ id: appointmentId, name: patientName });
    setShowDeleteModal(true);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const { date_time, schedule } = formData;
      let uploadedImageUrl = '';
      if (file) {
        uploadedImageUrl = await uploadImageToCloudinary(file);
      }
      if (date_time) {
        const startTimeParts = schedule.time_slots.start_time.split(':');
        const endTimeParts = schedule.time_slots.end_time.split(':');

        const appointmentStartTime = new Date(date_time);
        appointmentStartTime.setHours(Number(startTimeParts[0]), Number(startTimeParts[1]));

        const appointmentEndTime = new Date(date_time);
        appointmentEndTime.setHours(Number(endTimeParts[0]), Number(endTimeParts[1]));

        const appointmentData = {
          ...formData,
          schedule: {
            ...schedule,
            time_slots: {
              start_time: appointmentStartTime,
              end_time: appointmentEndTime,
            }
          },
          order_photo: uploadedImageUrl
        };
        
        if (isEditing && editingAppointment) {
          if(editingAppointment._id)
          await updateAppointment(editingAppointment._id, appointmentData as unknown as CreateAppointmentDto);
        } else {
          await makeAppointment(appointmentData as unknown as CreateAppointmentDto);
        }

        fetchAppointments();
        toast.success('El turno ha sido ' + (isEditing ? 'editado' : 'creado') + ' con éxito');
        toggleForm(); // Close the form after submission
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(errorMessage);
    }
  };
  const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ onClose, onConfirm, patientName }) => {
    if (!showDeleteModal) return (
      <div></div>
    )
    return (
      <div className="modal-two">
        <div className="modalContent-two">
          <h2>Confirmar eliminación</h2>
          <p>¿Estás seguro que quieres eliminar el turno del paciente {patientName}?</p>
          <div className="modalButtons-two">
            <button onClick={onClose}>Cancelar</button>
            <button onClick={onConfirm}>Confirmar</button>
          </div>
        </div>
      </div>
    );
  };
  
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // const totalPages = Math.ceil(appointments.length / appointmentsPerPage);
  return (
    <div className="appointmentsContainer">
      <div className="actionsContainer">
        <div className="addAppointmentContainer" onClick={toggleForm}>
          <i className="fa-solid fa-calendar-plus addAppointmentIcon"></i>
          <span className="addAppointmentText">Agregar turno</span>
        </div>
        <div className="addBulkAppointments" onClick={toggleBulkForm}>
          <i className="fa-solid fa-calendar-plus addAppointmentIcon"></i>
          <span className="addAppointmentText">Carga Masiva de turnos</span>
        </div>
      </div>
      <table className="appointmentsTable">
  <thead>
    <tr>
      <th>ID</th>
      <th>Fecha</th>
      <th>Paciente</th>
      <th>Profesional</th>
      <th>Hora</th>
      <th>Tratamiento</th>
      <th>Estado</th>
      <th>Acciones</th>
    </tr>
  </thead>
  {currentAppointments.length > 0 ? (
    <tbody>
      {currentAppointments.map((appointment) => (
        <tr key={appointment._id}>
          <>
            <td>{appointment._id || 'N/A'}</td>
            <td>{appointment.date_time ? formatDate(appointment.date_time as unknown as Date) : 'N/A'}</td>
            <td>
              {isPatient(appointment.pacient_id)
                ? `${appointment.pacient_id.user_id.firstname} ${appointment.pacient_id.user_id.lastname}`
                : 'N/A'}
            </td>
            <td>
              {isProfessional(appointment.professional_id)
                ? `${appointment.professional_id.user_id.firstname} ${appointment.professional_id.user_id.lastname}`
                : 'N/A'}
            </td>
            <td>{appointment.schedule?.time_slots?.start_time ? formatTime(appointment.schedule.time_slots.start_time as unknown as string) : 'N/A'}</td>
            <td>{appointment.session_type || 'N/A'}</td>
            <td>
              <span className={`statusIndicator ${appointment.state?.toLowerCase() || ''}`}></span>
              {appointment.state || 'N/A'}
            </td>
            <td>
              <button className='edit-button' style={{margin:'0.5rem'}} onClick={() => handleEdit(appointment)}>
                <i className="fa-solid fa-edit"></i>
              </button>
              <button className='edit-button' style={{margin:'0.5rem'}} onClick={() => {
                if (isPatient(appointment.pacient_id) && appointment.date_time) {
                  sendWhatsAppMessageConfirmAppointment(appointment.pacient_id.user_id.phone, appointment.date_time)
                }
              }}>
                <FontAwesomeIcon className="iconosRedes" icon={faWhatsapp} />
              </button>
              <button style={{margin:'0.5rem'}} onClick={() => {
                if (appointment._id && isPatient(appointment.pacient_id)) {
                  handleDeleteClick(appointment._id, `${appointment.pacient_id.user_id?.firstname} ${appointment.pacient_id.user_id?.lastname}`)
                }
              }} className="delete-button">
                <i className="fa-solid fa-trash"></i>
              </button>
              <button className='order_url' style={{margin:'0.5rem'}} onClick={() => {
                if (typeof appointment.order_photo === 'string') {
                  openPhotoOrder(appointment.order_photo);
                }
              }}>
                <i className="fa-regular fa-image"></i>
              </button>
            </td>
          </>
        </tr>
      ))}
    </tbody>
  ) : loading?(
    <tbody>
      <tr>
        <td colSpan={8}> Cargando...</td>
      </tr>
    </tbody>
  ): (
    <tbody>
      <tr>
        <td colSpan={8}> No hay turnos ingresados</td>
      </tr>
    </tbody>
  )}
</table>
      <div className="pagination">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="paginationButton"  // Deshabilitar si está en la primera página
        >
          Anterior
        </button>

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === Math.ceil(appointments.length / appointmentsPerPage)}
          className="paginationButton"  // Deshabilitar si está en la última página
        >
          Siguiente
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="appointmentForm">
          <div>
            <label htmlFor="pacient_id">Paciente:</label>
            <select name="pacient_id" value={formData.pacient_id} onChange={handleInputChange}>
              <option value="">Seleccione un paciente</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.user_id.firstname} {patient.user_id.lastname}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="professional_id">Profesional:</label>
            <select name="professional_id" value={formData.professional_id} onChange={handleInputChange}>
              <option value="">Seleccione un profesional</option>
              {professionals.map((professional) => (
                <option key={professional._id} value={professional._id}>
                  {professional.user_id.firstname} {professional.user_id.lastname}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date_time">Fecha y hora:</label>
            <input
              type="date"
              name="date_time"
              value={formData.date_time ? new Date(formData.date_time).toISOString().slice(0, 10) : ''}
              onChange={handleInputChange}
            />

          </div>
          <div>
            <label htmlFor="start_time">Hora de inicio:</label>
            <input
              type="time"
              name="start_time"
              value={formData.schedule.time_slots.start_time}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="end_time">Hora de fin:</label>
            <input
              type="time"
              name="end_time"
              value={formData.schedule.time_slots.end_time}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="session_type">Tipo de sesión:</label>
            <input
              type="text"
              name="session_type"
              value={formData.session_type}
              onChange={handleInputChange}
              required
            />
            <label style={{ color: 'rgb(151, 143, 127)' }} htmlFor=""> Ingrese la imagen de la orden:
              <input
                type="file"
                style={{ margin: '1rem' }}
                onChange={handleFileChange}
                accept="image/*"
              />
              {filePreview && <img src={filePreview} alt="Vista previa" style={{ maxWidth: '200px' }} />}
            </label>
          </div>
          <div className="formActions">
            <button type="submit">{isEditing ? 'Actualizar' : 'Crear'} Turno</button>
            <button type="button" onClick={toggleForm}>Cancelar</button>
          </div>
        </form>
      )}
      {showBulkForm && (
        <BulkAppointments
          patients={patients as unknown as Patient[]}
          professionals={professionals as unknown as Professional[]}
          onClose={toggleBulkForm}
          onSuccess={fetchAppointments}
        />
      )}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        patientName={appointmentToDelete?.name || ''}
      />
      <ToastContainer />
    </div>
  );
};

export default Appointments;
