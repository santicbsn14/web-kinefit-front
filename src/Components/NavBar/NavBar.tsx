import React, { useState, useEffect } from 'react';
import mainLog from '../Imagenes/logo_kinefit.webp';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { toast, ToastContainer } from 'react-toastify';

const NavBar = (): JSX.Element => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const location = useLocation();
    const isSystemRoute = location.pathname.startsWith('/system');
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = async () => {
        const auth = getAuth();
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            toast.error(errorMessage);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const navStyle = {
        marginTop: '0px',
        backgroundColor: 'orange',
        height: '50px',
        fontSize: '14px',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 0 0 20px',
    };

    const menuStyle = {
        listStyle: 'none',
        display: isMobile ? (isMenuOpen ? 'flex' : 'none') : 'flex',
        flexDirection: isMobile ? 'column' : 'row' as 'column' | 'row',
        position: isMobile ? 'absolute' : 'static' as 'absolute' | 'static',
        top: isMobile ? '50px' : 'auto',
        right: isMobile ? '0' : 'auto',
        backgroundColor: 'orange',
        width: isMobile ? '200px' : 'auto',
        margin: '0',
        padding: isMobile ? '20px' : '0',
        zIndex: 1000,
    };

    const menuItemStyle = {
        marginRight: isMobile ? '0' : '20px',
        marginBottom: isMobile ? '10px' : '0',
        textTransform: 'uppercase' as const,
    };

    return (
        <nav style={navStyle}>
            <img src={mainLog} alt="" style={{ height: '45px', borderRadius: '30px' }} />
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <ul style={menuStyle}>
                    <li style={menuItemStyle}><Link to='/' className='nav-link'>Inicio</Link></li>
                    <li style={menuItemStyle}><Link to='/tratamientos' className='nav-link'>Tratamientos</Link></li>
                    <li style={menuItemStyle}><Link to='/obrasSociales' className='nav-link'>Obras Sociales</Link></li>
                    <li style={menuItemStyle}><Link to='/quienesSomos' className='nav-link'>Quienes Somos</Link></li>
                    <li style={menuItemStyle}>Contacto</li>

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
                {isMobile && (
                    <button onClick={toggleMenu} style={{ 
                        background: 'none', 
                        border: 'none', 
                        fontSize: '24px', 
                        padding: '0 20px',
                        height: '100%'
                    }}>
                        ☰
                    </button>
                )}
            </div>
            <ToastContainer/>
        </nav>
    );
};

export default NavBar;