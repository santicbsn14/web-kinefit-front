import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { toast, ToastContainer } from 'react-toastify';
import mainLog from '../Imagenes/logo_kinefit.webp';
import './navbar.css';

const NavBar = (): JSX.Element => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isSystemRoute = location.pathname.startsWith('/system');
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Cierra el menú al navegar
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      navigate('/');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg);
    }
  };

  const navItem = (to: string, label: string) => (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
      >
        {label}
      </NavLink>
    </li>
  );

  return (
    <>
      <header className="navbar">
        <div className="nav-inner">
          <Link to="/" className="brand" aria-label="Ir al inicio">
            <img src={mainLog} alt="Kinefit" />
            <span className="brand-text">kinefit</span>
          </Link>

          {/* Desktop links */}
          {!isMobile && (
            <nav className="links">
              <ul>
                {navItem('/', 'Inicio')}
                {navItem('/tratamientos', 'Tratamientos')}
                {navItem('/obrasSociales', 'Obras Sociales')}
                {navItem('/quienesSomos', 'Quienes Somos')}
                {navItem('/contact', 'Contacto')}
              </ul>
            </nav>
          )}

          {/* CTA derecha (desktop) */}
          {!isMobile && (
            <div className="right-cta">
              {isSystemRoute ? (
                <button className="btn-ghost" onClick={handleLogout}>
                  <i className="fa-solid fa-right-to-bracket" />
                  <span>Cerrar sesión</span>
                </button>
              ) : (
                <Link to="/login" className="btn-ghost">
                  <i className="fa-solid fa-right-to-bracket" />
                  <span>Iniciar sesión</span>
                </Link>
              )}
            </div>
          )}

          {/* Hamburguesa (mobile) */}
          {isMobile && (
            <button
              className="hamb"
              aria-label="Abrir menú"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <i className="fa-solid fa-bars" />
            </button>
          )}
        </div>
      </header>

      {/* Drawer mobile */}
      {isMobile && (
        <>
          <div
            className={`backdrop ${open ? 'show' : ''}`}
            onClick={() => setOpen(false)}
            aria-hidden={!open}
          />
          <aside className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
            <div className="drawer-header">
              <span>Menú</span>
              <button
                className="close"
                aria-label="Cerrar menú"
                onClick={() => setOpen(false)}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <nav className="drawer-links">
              <ul>
                {navItem('/', 'Inicio')}
                {navItem('/tratamientos', 'Tratamientos')}
                {navItem('/obrasSociales', 'Obras Sociales')}
                {navItem('/quienesSomos', 'Quienes Somos')}
                {navItem('/contact', 'Contacto')}
                <li className="divider" />
                <li>
                  {isSystemRoute ? (
                    <button className="btn-ghost w-full" onClick={handleLogout}>
                      <i className="fa-solid fa-right-to-bracket" />
                      <span>Cerrar sesión</span>
                    </button>
                  ) : (
                    <Link to="/login" className="btn-ghost w-full">
                      <i className="fa-solid fa-right-to-bracket" />
                      <span>Iniciar sesión</span>
                    </Link>
                  )}
                </li>
              </ul>
            </nav>
          </aside>
        </>
      )}

      <ToastContainer />
    </>
  );
};

export default NavBar;
