import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../../Contexts/authContext";
import '../mainSystem.css';

const SystemNavbar = (): JSX.Element => {
  const { role } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar si la navbar está abierta o cerrada
 //@ts-expect-error debo hostear!
  if (role?.name === 'patient') {
    return <div> </div>;
  }

  const toggleNavbar = () => {
    setIsOpen(!isOpen); // Cambiar el estado de la navbar (abrir/cerrar)
  };

  return (
    <div>
      <button className="toggle-button" onClick={toggleNavbar}>
        <i className="fa-solid fa-bars"></i> {/* Ícono para el botón */}
      </button>
      
      <div className={`mosaic ${isOpen ? 'open' : 'collapsed'}`}> {/* Añadir clases para manejar colapso */}
        <Link to='agenda' style={{ color: 'black', textDecoration: 'none' }}>
          <div className="mosaic-item"><i className="fa-solid fa-calendar-days"></i><span>AGENDA</span></div>
        </Link>
        <Link to='users' style={{ color: 'black', textDecoration: 'none' }}>
          <div className="mosaic-item"><i className="fa-solid fa-user"></i><span>USUARIOS</span></div>
        </Link>
        <Link to='professionals' style={{ color: 'black', textDecoration: 'none' }}>
          <div className="mosaic-item"><i className="fa-solid fa-user-tie"></i><span>PROFESIONALES</span></div>
        </Link>
        <Link to='appointments' style={{ color: 'black', textDecoration: 'none' }}>
          <div className="mosaic-item"><i className="fa-solid fa-clock"></i><span>TURNOS</span></div>
        </Link>
        <Link to='patients' style={{ color: 'black', textDecoration: 'none' }}>
          <div className="mosaic-item"><i className="fa-solid fa-hospital-user"></i><span>PACIENTES</span></div>
        </Link>
      </div>
    </div>
  );
};

export default SystemNavbar;
