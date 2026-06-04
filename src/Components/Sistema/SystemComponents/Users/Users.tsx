import React, { useCallback, useEffect, useState } from 'react'
import './users.css'
import {  toast } from 'react-toastify'
import api from '../../../../Services/api'
import { IUser, Role } from '../../../../Utils/Types/userTypes'

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: Role
  dni: string
  phone: string
  birthDate: string
}

const ROLES: { value: Role; label: string }[] = [
  { value: 'patient', label: 'Paciente' },
  { value: 'professional', label: 'Profesional' },
  { value: 'secretary', label: 'Secretaria' },
  { value: 'admin', label: 'Administrador' },
]

const INITIAL_FORM: FormData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'patient',
  dni: '',
  phone: '',
  birthDate: '',
}

const ROLE_LABELS: Record<string, string> = {
  patient: 'Paciente',
  professional: 'Profesional',
  secretary: 'Secretaria',
  admin: 'Administrador',
}

const Users = () => {
  const [users, setUsers] = useState<IUser[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM)

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const response = await api.get('/users', { params: { page, limit: 10 } })
      setUsers(response.data.docs)
      setTotalPages(response.data.totalPages)
      setCurrentPage(page)
    } catch {
      toast.error('Error al cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers(1) }, [fetchUsers])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    try {
      const { confirmPassword, ...data } = formData
      await api.post('/users', data)
      toast.success('Usuario creado exitosamente')
      setTimeout(() => {
        setShowForm(false)
        setFormData(INITIAL_FORM)
      }, 1500)
      fetchUsers(currentPage)
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Error al crear el usuario')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return
    try {
      await api.delete(`/users/${userToDelete.id}`)
      toast.success('Usuario eliminado')
      fetchUsers(currentPage)
    } catch {
      toast.error('Error al eliminar el usuario')
    } finally {
      setShowDeleteModal(false)
      setUserToDelete(null)
    }
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div className="userTableContainer">

      <div className="addUserContainer" onClick={() => {
        setShowForm(!showForm)
        setFormData(INITIAL_FORM)
      }}>
        <i className="fa-solid fa-user-plus addUserIcon"></i>
        <span className="addUserText">Agregar usuario</span>
      </div>

      <div className="table-wrap">
        <table className="userTable">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={4}>No hay usuarios registrados</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{ROLE_LABELS[user.role] || user.role}</td>
                  <td>
                    <button
                      className="btn-ico btn-danger"
                      title="Eliminar"
                      onClick={() => {
                        setUserToDelete({ id: user._id, name: user.name })
                        setShowDeleteModal(true)
                      }}
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

      <div className="pagination">
        <button className="paginationButton" onClick={() => fetchUsers(currentPage - 1)} disabled={currentPage === 1}>
          Anterior
        </button>
        <span className="pageInfo">Página {currentPage} de {totalPages}</span>
        <button className="paginationButton" onClick={() => fetchUsers(currentPage + 1)} disabled={currentPage === totalPages}>
          Siguiente
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="userForm">
          <h3>Nuevo Usuario</h3>

          <input type="text" name="name" value={formData.name}
            onChange={handleInputChange} placeholder="Nombre completo" required />

          <input type="email" name="email" value={formData.email}
            onChange={handleInputChange} placeholder="Email" required />

          <input type="password" name="password" value={formData.password}
            onChange={handleInputChange} placeholder="Contraseña" required minLength={6} />

          <input type="password" name="confirmPassword" value={formData.confirmPassword}
            onChange={handleInputChange} placeholder="Repetir contraseña" required />

          <label>Rol:
            <select name="role" value={formData.role} onChange={handleInputChange} required>
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </label>

          {formData.role === 'patient' && (
            <>
              <input type="text" name="dni" value={formData.dni}
                onChange={handleInputChange} placeholder="DNI" required />
              <input type="tel" name="phone" value={formData.phone}
                onChange={handleInputChange} placeholder="Teléfono" required />
              <label>Fecha de nacimiento:
                <input type="date" name="birthDate" value={formData.birthDate}
                  onChange={handleInputChange} required />
              </label>
            </>
          )}

          <div className="formActions">
            <button type="submit">Crear usuario</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmar eliminación</h2>
            <p>¿Estás seguro que querés eliminar a <strong>{userToDelete?.name}</strong>?</p>
            <div className="modal-buttons">
              <button onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button onClick={handleDeleteConfirm}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Users