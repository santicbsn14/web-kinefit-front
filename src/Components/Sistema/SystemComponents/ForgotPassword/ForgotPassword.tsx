import React, { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import api from '../../../../Services/api'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Por favor ingresá tu correo electrónico')
      return
    }
    setIsLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      toast.success('Si el email existe en el sistema, recibirás instrucciones para recuperar tu contraseña.')
      setEmail('')
    } catch {
      toast.error('Ocurrió un error. Por favor intentá nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div>
        <h2>¿Olvidaste tu contraseña?</h2>
        <p>Ingresá tu correo electrónico para recibir instrucciones de recuperación.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ margin: 'auto' }}
          className="form-control"
          disabled={isLoading}
        />
        <button
          type="submit"
          style={{ margin: 'auto' }}
          className="btn align-self-start mt-3"
          disabled={isLoading}
        >
          {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
        </button>
      </form>
      <ToastContainer />
    </div>
  )
}

export default ForgotPassword