import { useEffect } from 'react'
import './mainSystem.css'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../Contexts/authContext'

const MainSystem = (): JSX.Element => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role === 'patient') {
      navigate('/system/patient-dashboard')
    }
  }, [user, navigate])

  return (
    <div className='mainSystem'>
      <h3 style={{ marginTop: '3rem', color: 'grey' }}>
        Bienvenido {user?.name}, que tengas buena jornada!
      </h3>
      {user && <p>Tu rol es: {user.role}</p>}
    </div>
  )
}

export default MainSystem