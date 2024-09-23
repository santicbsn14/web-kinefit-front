import React, { useEffect, useState } from 'react';
import './professionals.css';
import { getProfessionals } from '../../../../MockService/professionals';
import { getUsers } from '../../../../MockService/users';


interface FormData {
  username: string;
  especialidades: string[];
}



const Professionals: React.FC = () => {
  const [professionals, setProfessionals] = useState<{ _id: string, user_id: { firstname: string } }[]>([]);
  const [users, setUsers] = useState<{ _id: string,  firstname: string  }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    especialidades: [],
  });
  useEffect(() => {
    const fetchProfessionals = async () => {
      const professionalsData = await getProfessionals();
      setProfessionals(professionalsData.professionals);
    };
    const fetchUsers = async () => {
      const usersData = await getUsers()
      setUsers(usersData.users)
    }
    fetchProfessionals();
    fetchUsers()
  }, []);
  const [scheduleData, setScheduleData] = useState({
    name_professional: '',
    week_day: 1,
    time_slots: [{ start_time: '', end_time: '' }],
    state: 'Disponible', 
  });
  
  const profesionales= [
    {
      id: '1',
      nombre: 'Ana',
      apellido: 'Martínez',
      especialidades: ['Cardiología', 'Interna'],
      email: 'ana.martinez@example.com',
      telefono: '123-456-7890',
    },
    {
      id: '2',
      nombre: 'Luis',
      apellido: 'Gómez',
      especialidades: ['Neurología'],
      email: 'luis.gomez@example.com',
      telefono: '987-654-3210',
    },
    {
      id: '3',
      nombre: 'Elena',
      apellido: 'Rodríguez',
      especialidades: ['Dermatología', 'Pediatría'],
      email: 'elena.rodriguez@example.com',
      telefono: '555-555-5555',
    },
  ];

  const especialidades = ['Terapia de manos', 'Rehabilitacion de rodilla', 'Osteopatia'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (especialidad: string) => {
    setFormData((prevData) => {
      if (prevData.especialidades.includes(especialidad)) {
        return {
          ...prevData,
          especialidades: prevData.especialidades.filter((e) => e !== especialidad),
        };
      } else {
        return {
          ...prevData,
          especialidades: [...prevData.especialidades, especialidad],
        };
      }
    });
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setScheduleData({ ...scheduleData, [name]: value });
  };

  const handleScheduleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(scheduleData);
    toggleModal(); 
  };

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
          </tr>
        </thead>
        <tbody>
          {profesionales.map((profesional) => (
            <tr key={profesional.id}>
              <td>{profesional.id}</td>
              <td>{profesional.nombre}</td>
              <td>{profesional.apellido}</td>
              <td>{profesional.especialidades.join(', ')}</td>
              <td>{profesional.email}</td>
              <td>{profesional.telefono}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <form onSubmit={() => { }} className="professionalForm">
              <label>
                Nombre Usuario:
                <select
                  name="userId"
                  value={formData.username}
                  onChange={() => handleInputChange}
                  required
                >
                  <option value="">Seleccione un usuario</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.firstname}
                    </option>
                  ))}
                </select>
                </label>
          <div>
            <label>Especialidad(es):</label>
            {especialidades.map((especialidad) => (
              <div key={especialidad}>
                <input
                  type="checkbox"
                  id={especialidad}
                  name="especialidades"
                  value={especialidad}
                  checked={formData.especialidades.includes(especialidad)}
                  onChange={() => handleCheckboxChange(especialidad)}
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
                  name="professionalId"
                  value={scheduleData.name_professional}
                  onChange={handleScheduleChange}
                  required
                >
                  <option value="">Seleccione un profesional</option>
                  {professionals.map((professional) => (
                    <option key={professional._id} value={professional._id}>
                      {professional.user_id?.firstname || `Profesional ${professional._id}` }
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Día de la Semana:
                <select
                  name="week_day"
                  value={scheduleData.week_day}
                  onChange={handleScheduleChange}
                >
                  <option value={1}>Lunes</option>
                  <option value={2}>Martes</option>
                  <option value={3}>Miércoles</option>
                  <option value={4}>Jueves</option>
                  <option value={5}>Viernes</option>
                </select>
              </label>
              <label>
                Hora de Inicio:
                <input type="time" name="start_time" onChange={handleScheduleChange} required />
              </label>
              <label>
                Hora de Fin:
                <input type="time" name="end_time" onChange={handleScheduleChange} required />
              </label>
              <label>
                Estado:
                <select
                  name="state"
                  value={scheduleData.state}
                  onChange={(e) => setScheduleData({ ...scheduleData, state: e.target.value })}
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
    </div>
  );
};

export default Professionals;