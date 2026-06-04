import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../../../Services/api'

const ChangePassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const token = searchParams.get('token')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error('Link inválido o expirado. Solicitá uno nuevo.')
      return
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setIsLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      toast.success('¡Contraseña actualizada! Redirigiendo al login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'El link expiró o es inválido. Solicitá uno nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h2>Link inválido</h2>
          <p>El link de recuperación es inválido o expiró.</p>
          <a href="/forgotPassword">Solicitá uno nuevo</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h2>Crear nueva contraseña</h2>
          <p>Ingresá tu nueva contraseña</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
            style={{ margin: 'auto', marginBottom: '1rem' }}
            disabled={isLoading}
            required
            minLength={6}
          />
          <input
            type="password"
            placeholder="Confirmar nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="form-control"
            style={{ margin: 'auto', marginBottom: '1rem' }}
            disabled={isLoading}
            required
          />
          <button
            type="submit"
            className="btn"
            style={{ margin: 'auto', marginBottom: '1rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword