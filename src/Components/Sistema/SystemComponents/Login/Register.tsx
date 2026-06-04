import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { register } from '../../../../Services/authService'
import { useAuth } from '../../../../Contexts/authContext'
import './viewLogin.css'

const Register = () => {
  const navigate = useNavigate()
  const { login: setAuth } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dni: '',
    phone: '',
    birthDate: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)
    try {
      const { confirmPassword, ...data } = formData
      const result = await register(data)
      setAuth(result)
      toast.success('¡Cuenta creada exitosamente!')
      setTimeout(() => navigate('/system'), 1500)
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Error al crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='mainForm container-fluid'>
      <div className="row">
        <form className='col-lg-6' onSubmit={handleSubmit}>
          <h2 style={{ marginBottom: '1.5rem' }}>Crear cuenta</h2>
          <div className="d-flex flex-column">
            <input
              className="form-control mb-3"
              type="text"
              name="name"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <input
              className="form-control mb-3"
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <input
              className="form-control mb-3"
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              disabled={isLoading}
            />
            <input
              className="form-control mb-3"
              type="password"
              name="confirmPassword"
              placeholder="Repetir contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <input
              className="form-control mb-3"
              type="text"
              name="dni"
              placeholder="DNI"
              value={formData.dni}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <input
              className="form-control mb-3"
              type="tel"
              name="phone"
              placeholder="Teléfono"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <label style={{ color: 'rgb(151, 143, 127)', marginBottom: '4px' }}>
              Fecha de nacimiento
            </label>
            <input
              className="form-control mb-3"
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <button
              className='btn align-self-start mt-2'
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
              ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
            </p>
          </div>
        </form>
        <div className="col-lg-6">
          <h2>Creá tu cuenta y gestioná tus turnos!</h2>
        </div>
      </div>
    </div>
  )
}

export default Register