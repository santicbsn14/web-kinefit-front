import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';

import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../../MockService/auth';


const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setErrorMessage('Por favor ingresa tu correo electrónico');
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email, {
        url: 'https://web-kinefit-front.vercel.app/resetPassword',
        handleCodeInApp: true, // Asegura que Firebase use la URL personalizada
      });
      toast.success('Hemos enviado un enlace de recuperación a tu correo electrónico.Por favor revisa tu bandeja de entrada')
      setEmail('');
    } catch (error) {
      
      toast.error(errorMessage)
      //@ts-expect-error error verificado
      switch (error.code) {
        case 'auth/invalid-email':
          setErrorMessage('El correo electrónico no es válido');
          break;
        case 'auth/user-not-found':
          setErrorMessage('No existe una cuenta con este correo electrónico');
          break;
        case 'auth/too-many-requests':
          setErrorMessage('Demasiados intentos. Por favor, intenta más tarde');
          break;
        default:
          setErrorMessage('Ocurrió un error al enviar el email. Por favor intenta nuevamente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      <div className="">
        <div className="">
          <h2 className="">¿Olvidaste tu contraseña?</h2>
          <p className="">
            Ingresa tu correo electrónico para recibir un enlace de recuperación.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{margin:'auto'}}
                className="form-control"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              style={{margin:'auto'}}
              className='btn align-self-start mt-3'
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default ForgotPassword;