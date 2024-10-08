import {useNavigate } from 'react-router-dom';
import './viewLogin.css'
import { signInWithEmailAndPassword } from 'firebase/auth';
import * as React from 'react'
import { auth } from '../../MockService/auth';
import { userLoginSucces } from '../../Utils/Types/userTypes';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

  const LoginComponent = () => {
    const navigate = useNavigate();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [successMessage, setSuccessMessage] = React.useState('');
    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log(userCredential)
        const user : userLoginSucces = userCredential.user;
        if (user.accessToken) {
          setErrorMessage('')
          toast.success('¡Login exitoso! Redirigiendo...')
          setSuccessMessage('¡Login exitoso! Redirigiendo...');
          setTimeout(() => {
            navigate(`/system`);
          }, 2000);;
        }
      } catch (error: unknown) {
        toast.error('Error en el login: ' + error.message)
        setErrorMessage('Error en el login: ' + error.message);
        console.error('Error en el login:', error);
      }
    };
  
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
            </div>
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            {errorMessage && <p style={{color:'red'}}>{errorMessage}</p>}
          </form>
          <div className="col-lg-6">
            <h2>Ingresa tus datos y accede!</h2>
          </div>
          <ToastContainer />
        </div>
      </div>
      
    );
  };
  
  export default LoginComponent;