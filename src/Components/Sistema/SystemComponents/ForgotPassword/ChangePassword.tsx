import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../../../../MockService/auth';
import { ToastContainer, toast } from 'react-toastify';
import { getUserByEmail, updatePasswordMongo } from '../../../../MockService/users';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [oobCode, setOobCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState(''); 
  const [status, setStatus] = useState<'verifying' | 'ready' | 'error' | 'success'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Obtener y verificar el código de reseteo del URL
    const code = searchParams.get('oobCode');
    if (!code) {
      setStatus('error');
      setErrorMessage('Link inválido o expirado');
      return;
    }

    const verifyCode = async () => {
      try {
        // Verificar que el código sea válido
        const email = await verifyPasswordResetCode(auth, code);
        setOobCode(code);
        setUserEmail(email);
        setStatus('ready');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        toast.error(errorMessage)
        setErrorMessage('El link ha expirado o ya no es válido. Por favor solicita uno nuevo.');
        //@ts-expect-error error verificado
        toast.error(error)
      }
    };

    verifyCode();
  }, [searchParams]);

  const validatePassword = (password: string) => {
    // Ajusta estas reglas según tus requisitos de seguridad
    return password.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!validatePassword(password)) {
      setStatus('error');
      setErrorMessage('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    setStatus('ready');
    
    try {
        const userMongo = await getUserByEmail(userEmail)
        const newPassword = {password: password}
        await updatePasswordMongo(newPassword, userMongo.id)
        await confirmPasswordReset(auth, oobCode, password);

      toast.success('¡Tu contraseña ha sido actualizada con éxito.Serás redirigido al login en unos segundos')
      setIsLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error(error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    toast.error(errorMessage)
    //@ts-expect-error error verificado
      switch (error.code) {
        case 'auth/expired-action-code':
          setErrorMessage('El link ha expirado. Por favor solicita uno nuevo.');
          break;
        case 'auth/invalid-action-code':
          setErrorMessage('El link ya no es válido. Por favor solicita uno nuevo.');
          break;
        case 'auth/weak-password':
          setErrorMessage('La contraseña es demasiado débil. Intenta con una más segura.');
          break;
        default:
          setErrorMessage('Ocurrió un error al actualizar la contraseña. Por favor intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600">Verificando link...</p>
        </div>
      </div>
    );
  }

  if (status === 'error' && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
            {toast.error(errorMessage)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="max-w-md w-full  rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Crear nueva contraseña</h2>
          <p className="mt-2 text-gray-600">
            Por favor ingresa tu nueva contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={password}
                style={{margin:'auto',marginBottom:'1rem'}}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                disabled={isLoading}
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Confirmar nueva contraseña"
                value={confirmPassword}
                style={{margin:'auto', marginBottom:'1rem'}}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-control"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className='btn'
              style={{margin:'auto', marginBottom:'1rem'}}
              disabled={isLoading}
            >
            Actualizar contraseña
            </button>
          </div>
        </form>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default ResetPassword;