import  { useEffect, useState } from 'react';
import './mainSystem.css';
import { getAuth } from 'firebase/auth';
import { getUserByEmail } from '../../MockService/users';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { toast, ToastContainer } from 'react-toastify';

const MainSystem = (): JSX.Element => {
    const [userRole, setUserRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const email = getAuth().currentUser?.email;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserRole = async () => {
            if (email) {
                try {
                    setIsLoading(true);
                    const response = await getUserByEmail(email);
                    setUserRole(response.role);
                    if (response.role.name === "patient") {
                        navigate("/system/patient-dashboard");
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    toast.error(errorMessage);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchUserRole();
    }, [email, navigate]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-orange-500">
                <div className="text-center">
                    {/* <CompanyLogo className="w-32 h-32 mx-auto mb-4" /> */}
                    <p className="text-white text-xl font-bold">Cargando...</p>
                </div>
            </div>
        );
    }
    return (
        <div className='mainSystem'>
            <h3 style={{ marginTop: '3rem', color: 'grey' }}>
                Bienvenido {email}, que tengas buena jornada!
            </h3>
            {userRole && <p>Tu rol es: {userRole.name}</p>} {/* Muestra el rol del usuario */}
            <ToastContainer/>
        </div>
    );
};

export default MainSystem;
