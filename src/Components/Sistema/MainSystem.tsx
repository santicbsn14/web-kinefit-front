import React, { useEffect, useState } from 'react';
import './mainSystem.css';
import { getAuth } from 'firebase/auth';
import { getUserByEmail } from '../../MockService/users';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { toast, ToastContainer } from 'react-toastify';

const MainSystem = (): JSX.Element => {
    const [userRole, setUserRole] = useState<{ name: string; permissions: string[] } | null>(null); // Estado para almacenar el rol del usuario
    const email = getAuth().currentUser?.email;
    const navigate = useNavigate(); // Crea una instancia de navigate

    useEffect(() => {
        const fetchUserRole = async () => {
            if (email) {
                try {
                    // Realiza la solicitud a tu backend para obtener el rol del usuario
                    const response = await getUserByEmail(email)

                    setUserRole(response.role);
                    // Redirige si el rol es "patient"
                    if (response.role.name === "patient") {
                        navigate("/system/patient-dashboard"); // Redirige a la ruta correspondiente
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    toast.error(errorMessage)
                }
            }
        };

        fetchUserRole();
    }, [email, navigate]); // Asegúrate de agregar navigate a las dependencias

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
