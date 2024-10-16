import React, { useEffect, useState } from 'react';
import './patients.css';
import { getUsers } from '../../../../MockService/users';
import { createPatient, getPatients, deletePatient, updatePatient, Patient } from '../../../../MockService/patients';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Patients = () => {
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState<{ id: string, firstname: string, lastname: string, mutual: string }[]>([]);
  const [patients, setPatients] = useState<{ _id: string, user_id: { firstname: string; lastname: string; email: string; phone: string }, mutual: string, clinical_data: string[] }[]>([]);
  const [formData, setFormData] = useState({
    user_id: '',
    mutual: '',
    clinical_data: [''], // Cambiado a un array vacío
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const patientsPerPage = 6;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "clinical_data") {
      const newClinicalData = [...formData.clinical_data];
      newClinicalData[0] = value; // Si solo hay un campo, se actualiza directamente
      setFormData({ ...formData, clinical_data: newClinicalData });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addClinicalDataField = () => {
    setFormData({ ...formData, clinical_data: [...formData.clinical_data, ''] }); // Añadir un nuevo campo
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    setIsEditing(false); // Reiniciar estado de edición al abrir el formulario
    setFormData({ user_id: '', mutual: '', clinical_data: [''] }); // Reiniciar datos del formulario
  };

  const fetchUsers = async () => {
    const usersData = await getUsers();
    setUsers(usersData.users);
  };

  const fetchPatients = async () => {
    const patientsData = await getPatients();
    setPatients(patientsData.patients);
  };

  useEffect(() => {
    fetchUsers();
    fetchPatients();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (isEditing && currentPatientId) {
        await updatePatient(currentPatientId, formData);
        toast.success('¡Actualización de paciente exitosa!');
      } else {
        await createPatient(formData);
        toast.success('¡Creación de paciente exitosa!');
      }
      fetchPatients();
      toggleForm();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(errorMessage);
    }
  };

  const handleEdit = (patient: Patient) => {
    setFormData({
      user_id: patient.user_id._id,
      mutual: patient?.mutual || 'No hay mutual',
      clinical_data: patient.clinical_data,
    });
    setCurrentPatientId(patient._id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (patientId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este paciente?')) {
      try {
        await deletePatient(patientId);
        fetchPatients();
        toast.success('¡Paciente eliminado exitosamente!');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(errorMessage);
      }
    }
  };
    // Lógica de paginación
    const indexOfLastPatient = currentPage * patientsPerPage;
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
    const currentPatients = patients.slice(indexOfFirstPatient, indexOfLastPatient);
  
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentPatients.map((paciente) => (
            <tr key={paciente._id}>
              <td>{paciente._id}</td>
              <td>{paciente.user_id.firstname}</td>
              <td>{paciente.user_id.lastname}</td>
              <td>{paciente.mutual}</td>
              <td>
                <span className={`statusIndicator`}></span>
              </td>
              <td>
                <button className='edit-button' onClick={() => handleEdit(paciente)}>
                <i className="fa-solid fa-edit"></i>
                </button>
                <button className='delete-button' onClick={() => handleDelete(paciente._id)}>
                <i className="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button 
          onClick={() => paginate(currentPage - 1)} 
          disabled={currentPage === 1}
          className="paginationButton"
        >
          Anterior
        </button>
        <span className="pageInfo">{`Página ${currentPage} de ${Math.ceil(users.length / patientsPerPage)}`}</span>
        <button 
          onClick={() => paginate(currentPage + 1)} 
          disabled={indexOfLastPatient>= patients.length}
          className="paginationButton"
        >
          Siguiente
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="patientForm">
          <label>
            Nombre Usuario:
            <select
              name="user_id"
              value={formData.user_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione un usuario</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstname} {user.lastname}
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
          {formData.clinical_data.map((data, index) => (
            <input
              key={index}
              type="text"
              name="clinical_data"
              value={data}
              onChange={(e) => {
                const newClinicalData = [...formData.clinical_data];
                newClinicalData[index] = e.target.value; // Actualiza el valor específico
                setFormData({ ...formData, clinical_data: newClinicalData });
              }}
              placeholder="Datos clínicos"
              required
            />
          ))}
          <button type="button" onClick={addClinicalDataField}>Agregar campo de datos clínicos</button>
          <button type="submit">{isEditing ? 'Actualizar Paciente' : 'Agregar Paciente'}</button>
        </form>
      )}
      <ToastContainer />
    </div>
  );
};

export default Patients;
