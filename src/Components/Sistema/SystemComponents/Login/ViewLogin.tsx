import { Link, useNavigate } from 'react-router-dom'
import './viewLogin.css'
import * as React from 'react'
import { toast } from 'react-toastify'
import { login } from '../../../../Services/authService'
import { useAuth } from '../../../../Contexts/authContext'

const LoginComponent = () => {
  const navigate = useNavigate()
  const { login: setAuth } = useAuth()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const data = await login({ email, password })
      setAuth(data)
      toast.success('¡Login exitoso! Redirigiendo...')
      setTimeout(() => {
        navigate('/system')
      }, 2000)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido'
      toast.error('Error en el login: ' + msg)
    }
  }

  return (
    <div className='mainForm container-fluid'>
      <div className="row">
        <form className='col-lg-6' onSubmit={handleLogin}>
          <div className="d-flex flex-column">
            <input
              className="form-control mb-3"
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="form-control mb-3"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className='btn align-self-start mt-3' type="submit">Iniciar sesión</button>
            <p style={{ textAlign: 'center' }}>
              ¿No tenés cuenta? <Link to="/register">Registrate acá</Link>
            </p>
            <p style={{ textAlign: 'center' }}>
              ¿Olvidaste tu contraseña? <Link to="/forgotPassword">Recuperala acá</Link>
            </p>
          </div>
        </form>
        <div className="col-lg-6">
          <h2>Ingresa tus datos y accede!</h2>
        </div>
      </div>
    </div>
  )
}

export default LoginComponent