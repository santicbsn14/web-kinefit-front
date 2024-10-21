import React from 'react';
import './users.css';
import { createUser, getUsers, updateUser, IUser, deleteUserMongo } from '../../../../MockService/users';
import { getRoles } from '../../../../MockService/roles';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
interface FormData {
  _id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phone: number;
  age: number;
  dni: number;
  role: string;
  homeAdress: string;
  status: boolean;
  password: string;
  confirmPassword?: string
}


// Tipos para el modal de confirmación
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}
const Users = () => {
  const [roles, setRoles] = React.useState<{id: string, name: string}[]>([]);
  const [users, setUsers] = React.useState<IUser[]>([]);
  const [showForm, setShowForm] = React.useState(false);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<{ id: string, name: string } | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState<FormData>({
    _id: '',
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    phone: 0,
    age: 0,
    dni: 0,
    role: '',
    homeAdress: '',
    status: true,
    password: '',
    confirmPassword:''
  });

  // Nuevo estado para paginación
  const [currentPage, setCurrentPage] = React.useState(1);
  const usersPerPage = 6;

  // Tipar correctamente las funciones asíncronas
  const fetchUsers = async (): Promise<void> => {
    const usersData = await getUsers();
    setUsers(usersData.users);
  };

  React.useEffect(() => {
    const fetchRoles = async (): Promise<void> => {
      const rolesData = await getRoles();
      setRoles(rolesData.roles);
    };
    fetchRoles();
    fetchUsers();
  }, []);

  const handleDeleteUser = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setShowConfirmModal(true);
  };

  const confirmDeleteUser = async (): Promise<void> => {
    if (userToDelete) {
      try {
        await deleteUserMongo(userToDelete.id);
        toast.success('Se ha eliminado el usuario con éxito!');
        fetchUsers();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(errorMessage);
      }
    }
    setShowConfirmModal(false);
    setUserToDelete(null);
  };

  // Tipos para el modal de confirmación
  const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, userName }) => {
    if (!isOpen) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Confirmar eliminación</h2>
          <p>¿Estás seguro que quieres eliminar al usuario {userName}?</p>
          <div className="modal-buttons">
            <button onClick={onClose}>Cancelar</button>
            <button onClick={onConfirm}>Confirmar</button>
          </div>
        </div>
      </div>
    );
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newValue = (name === 'dni' || name === 'age' || name === 'phone') ? Number(value) : value;
    setFormData((prevData) => ({ ...prevData, [name]: newValue }));
  };

  const toggleForm = (user?: IUser) => {
    if (user) {
      setFormData({
        _id: user?.id as unknown as string,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        phone: user.phone,
        age: user.age,
        dni: user.dni,
        role: user.role as unknown as string,
        homeAdress: user.homeAdress,
        status: user.status,
        password: ''
      });
      setIsEditing(true);
    } else {
      setFormData({
        _id: '',
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        phone: '' as unknown as number,
        age: 0,
        dni:'' as unknown as number,
        role: '',
        homeAdress: '',
        status: true,
        password: ''
      });
      setIsEditing(false);
    }
    setShowForm(!showForm);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      if (isEditing) {
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...userData } = formData;
        await updateUser(formData._id, userData as IUser);
        toast.success('¡Actualización de usuario exitosa!');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, confirmPassword, ...newUserData }: IUser = formData;
        await createUser(newUserData as IUser);
        toast.success('¡Creación de usuario exitosa!');
      }
      const usersData = await getUsers();
      setUsers(usersData.users);
      setShowForm(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(errorMessage);
    }
  };

  // Lógica de paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="userTableContainer">
      <div className="addUserContainer" onClick={() => toggleForm()}>
        <i className="fa-solid fa-user-plus addUserIcon"></i>
        <span className="addUserText">Agregar usuario</span>
      </div>
      <table className="userTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user: IUser) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.firstname}</td>
              <td>{user.lastname}</td>
              <td>{user.email}</td>
              <td>{typeof user.role === 'object' && user.role !== null ? user.role.name : user.role}</td>
              <td>
                <span className={`statusIndicator ${user.status}`}></span>
              </td>
              <td>
                <button onClick={() => toggleForm(user)} className="edit-button">
                  <i className="fa-solid fa-edit"></i> 
                </button>
                <button onClick={() => {
                  //@ts-expect-error debo hostear!
                  handleDeleteUser(user.id, `${user.firstname} ${user.lastname}`)}
                  } className="delete-button">
                  <i className="fa-solid fa-trash"></i> 
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Botones de paginación */}
      <div className="pagination">
        <button 
          onClick={() => paginate(currentPage - 1)} 
          disabled={currentPage === 1}
          className="paginationButton"
        >
          Anterior
        </button>
        <span className="pageInfo">{`Página ${currentPage} de ${Math.ceil(users.length / usersPerPage)}`}</span>
        <button 
          onClick={() => paginate(currentPage + 1)} 
          disabled={indexOfLastUser >= users.length}
          className="paginationButton"
        >
          Siguiente
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="userForm">
          {isEditing && (
            <input
              type="text"
              name="_id"
              value={formData._id}
              readOnly
              placeholder="ID (solo lectura)"
            />
          )}
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleInputChange}
            placeholder="Nombre"
            required
          />
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleInputChange}
            placeholder="Apellido"
            required
          />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Nombre de usuario"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Correo electrónico"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Contraseña"
            required={!isEditing}
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirmar contraseña"
            required={!isEditing}
          />
          <label>
            Rol de Usuario:
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione el rol</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
          <input
            type="text"
            name="homeAdress"
            value={formData.homeAdress}
            onChange={handleInputChange}
            placeholder="Dirección"
            required
          />
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="Edad"
            required
          />
          <input
            type="text"
            name="dni"
            value={formData.dni}
            onChange={handleInputChange}
            placeholder="Número de documento"
            required
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Teléfono"
            required
          />
          <button type="submit">{isEditing ? 'Actualizar Usuario' : 'Agregar Usuario'}</button>
        </form>
      )}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmDeleteUser}
        userName={userToDelete?.name || ''}
      />
      <ToastContainer />
    </div>
  );
};

export default Users;