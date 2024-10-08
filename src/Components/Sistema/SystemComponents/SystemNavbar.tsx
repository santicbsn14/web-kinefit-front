import { Link } from "react-router-dom";
import { useAuth } from "../../../Contexts/authContext";
import '../mainSystem.css';

const SystemNavbar = (): JSX.Element => {
  const { role } = useAuth(); // Extraer el rol desde el contexto

  // Aplicar estilo display: none si el rol es "patient"
  if (role?.name === 'patient') {
    return <div> </div> // No renderizamos nada si es un paciente
  }

  return (
    <div className="mosaic">
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
  );
};

export default SystemNavbar;
