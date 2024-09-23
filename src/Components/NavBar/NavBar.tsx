import * as React from 'react';
import mainLog from '../Imagenes/logo_kinefit.webp';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const NavBar = (): JSX.Element => {
    const location = useLocation();
    const isSystemRoute = location.pathname.startsWith('/system');
    const navigate = useNavigate();
    const handleLogout = async () => {
        const auth = getAuth();
        try {
            await signOut(auth);
            navigate('/');  // Redirige al usuario a la página de inicio o donde prefieras después de cerrar la sesión
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };
    return (
        <nav style={{ marginTop: '0px', backgroundColor: 'orange', height: '50px', fontSize: '14px', width: '106.7%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src={mainLog} alt="" style={{ position: 'absolute', left: '0px', height: '45px', borderRadius: '30px' }} />
            <ul style={{ listStyle: 'none', display: 'flex', margin: '0', padding: '0' }}>
                <li style={{ marginRight: '20px', textTransform: 'uppercase' }}><Link to='/' className='nav-link'>Inicio</Link></li>
                <li style={{ marginRight: '20px', textTransform: 'uppercase' }}><Link to='/tratamientos' className='nav-link'>Tratamientos</Link></li>
                <li style={{ marginRight: '20px', textTransform: 'uppercase' }}><Link to='/obrasSociales' className='nav-link'>Obras Sociales</Link></li>
                <li style={{ marginRight: '20px', textTransform: 'uppercase' }}><Link to='/quienesSomos' className='nav-link'>Quienes Somos</Link></li>
                <li style={{ marginRight: '20px', textTransform: 'uppercase' }}>Contacto</li>
            </ul>
            <div style={{ position: 'absolute', right: '20px', textTransform: 'uppercase' }}>
            {isSystemRoute ? (
                    <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>
                        <i style={{ color: 'black' }} className="fa-solid fa-right-to-bracket">Cerrar sesión</i>
                    </button>
                ) : (
                    <Link to='/login' className='nav-link'>
                        <i style={{ color: 'black' }} className="fa-solid fa-right-to-bracket"></i>
                        <span>Iniciar Sesión</span>
                    </Link>
                )}
            </div>
        </nav>
    );
};
export default NavBar;
