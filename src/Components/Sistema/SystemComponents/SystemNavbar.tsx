import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../Contexts/authContext";
import "../mainSystem.css";

const items = [
  { to: "agenda",        icon: "fa-solid fa-calendar-days", label: "AGENDA" },
  { to: "users",         icon: "fa-solid fa-user",          label: "USUARIOS" },
  { to: "professionals", icon: "fa-solid fa-user-tie",      label: "PROFESIONALES" },
  { to: "appointments",  icon: "fa-solid fa-clock",         label: "TURNOS" },
  { to: "patients",      icon: "fa-solid fa-hospital-user", label: "PACIENTES" },
];

const SystemNavbar = (): JSX.Element => {
  const { role } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // ⭐ YA está en false, pero asegurémonos
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (role !== undefined) setIsLoading(false);
  }, [role]);

  useEffect(() => {
    // Agregar/quitar clase al body cuando cambia el estado
    if (isOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    
    // Cleanup al desmontar
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isOpen]);

  const toggleNavbar = () => setIsOpen(v => !v);
  const isActive = (to: string) => location.pathname.includes(`/${to}`);

  if (isLoading) return <div />;

  // @ts-expect-error debo hostear!
  if (role?.name === "patient") return <div />;

  return (
    <div>
      <button
        className="toggle-button"
        onClick={toggleNavbar}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
        aria-controls="system-sidebar"
      >
        <i className={`fa-solid ${isOpen ? 'fa-times' : 'fa-bars'}`} />
      </button>

      <nav
        id="system-sidebar"
        className={`mosaic ${isOpen ? "open" : ""}`}
        aria-hidden={!isOpen}
      >
        {items.map(item => (
          <Link key={item.to} to={item.to} className="mosaic-link">
            <div className={`mosaic-item ${isActive(item.to) ? "active" : ""}`}>
              <i className={item.icon} aria-hidden="true" />
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default SystemNavbar;