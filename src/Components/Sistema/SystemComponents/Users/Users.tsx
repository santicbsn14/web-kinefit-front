import React from 'react';
import './users.css';
import { createUser, getUsers, IUser } from '../../../../MockService/users';
import { getRoles } from '../../../../MockService/roles';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Users = () => {
  const [roles, setRoles] = React.useState<{id: string, name: string}[]>([]);
  const [users, setUsers] = React.useState<IUser[]>([])
  const [showForm, setShowForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    phone: '',
    age: 0,
    dni: '',
    role: '',
    homeAdress: '',
    status: true,
    password: ''
  });

  React.useEffect(() => {
    const fetchRoles = async () => {
      const rolesData = await getRoles();
      setRoles(rolesData.roles);
    };
    const fetchUsers = async () => {
      const usersData = await getUsers()
      setUsers(usersData.users)
    }
    fetchRoles();
    fetchUsers()
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
  
    const newValue = (name === 'dni' || name === 'age' || name === 'phone') ? Number(value) : value;
  
    setFormData((prevData) => ({ ...prevData, [name]: newValue }));
  };
  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      await createUser(formData as unknown as  IUser);
      toast.success('¡Creacion de usuario exitosa!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="userTableContainer">
      <div className="addUserContainer" onClick={toggleForm}>
        <i className="fa-solid fa-user-plus addUserIcon"></i>
        <span className="addUserText">Agregar usuario</span>
      </div>
      <table className="userTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Categoría</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.firstname}</td>
              <td>{user.lastname}</td>
              <td>{user.role?.name || ` ${user.role}`}</td>
              <td>
                <span className={`statusIndicator ${user.status}`}></span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && (
        <form onSubmit={handleSubmit} className="userForm">
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
            placeholder="Correo electronico"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Contraseña"
            required
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
            type="text"
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
          <button type="submit">Agregar Usuario</button>
        </form>
      )}
      <ToastContainer />
    </div>
  );
};

export default Users;
