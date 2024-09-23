import React, { useEffect, useState } from 'react';
import './patients.css';
import { getUsers } from '../../../../MockService/users';

const Patients = () => {
  const [showForm, setShowForm] = React.useState(false);
  const [users, setUsers] = useState<{ _id: string,  firstname: string  }[]>([]);
  const [formData, setFormData] = React.useState({
    username: '',
    mutual: '',
    clinical_data: '',
  });

  const pacientes = [
    { id: '1', nombre: 'Juan', apellido: 'Perez', mutual: 'Obra Social A', estado: 'activo' },
    { id: '2', nombre: 'Maria', apellido: 'Garcia', mutual: 'Obra Social B', estado: 'inactivo' },
    { id: '3', nombre: 'Carlos', apellido: 'Lopez', mutual: 'Particular', estado: 'activo' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
  };
  useEffect(() => {
    const fetchUsers = async () => {
      const usersData = await getUsers()
      setUsers(usersData.users)
    }
    fetchUsers()
  }, []);

  return (
    <div className="patientTableContainer">
      <div className="addPatientContainer" onClick={toggleForm}>
        <i className="fa-solid fa-user-plus addPatientIcon"></i>
        <span className="addPatientText">Agregar paciente</span>
      </div>
      <table className="patientTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Mutual</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {pacientes.map((paciente) => (
            <tr key={paciente.id}>
              <td>{paciente.id}</td>
              <td>{paciente.nombre}</td>
              <td>{paciente.apellido}</td>
              <td>{paciente.mutual}</td>
              <td>
                <span className={`statusIndicator ${paciente.estado}`}></span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && (
        <form onSubmit={handleSubmit} className="patientForm">
              <label>
                Nombre Usuario:
                <select
                  name="userId"
                  value={formData.username}
                  onChange={handleInputChange}
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
          <input
            type="text"
            name="mutual"
            value={formData.mutual}
            onChange={handleInputChange}
            placeholder="Mutual (opcional)"
          />
          <input
            type="text"
            name="clinical_data"
            value={formData.clinical_data}
            onChange={handleInputChange}
            placeholder="Datos clínicos"
            required
          />
          <button type="submit">Agregar Paciente</button>
        </form>
      )}
    </div>
  );
};

export default Patients;
