import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../Contexts/authContext";
import "../mainSystem.css";

const ALL_ITEMS = [
  { to: "agenda",        icon: "fa-solid fa-calendar-days", label: "AGENDA",         roles: ['admin', 'secretary', 'professional'] },
  { to: "users",         icon: "fa-solid fa-user",          label: "USUARIOS",        roles: ['admin', 'secretary'] },
  { to: "professionals", icon: "fa-solid fa-user-tie",      label: "PROFESIONALES",   roles: ['admin', 'secretary'] },
  { to: "appointments",  icon: "fa-solid fa-clock",         label: "TURNOS",          roles: ['admin', 'secretary', 'professional'] },
  { to: "patients",      icon: "fa-solid fa-hospital-user", label: "PACIENTES",       roles: ['admin', 'secretary'] },
  { to: "specialties",   icon: "fa-solid fa-stethoscope",   label: "ESPECIALIDADES",  roles: ['admin', 'secretary'] },
]

const SystemNavbar = (): JSX.Element => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    if (user !== undefined) setIsLoading(false)
  }, [user])

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open')
    } else {
      document.body.classList.remove('sidebar-open')
    }
    return () => {
      document.body.classList.remove('sidebar-open')
    }
  }, [isOpen])

  const toggleNavbar = () => setIsOpen(v => !v)
  const isActive = (to: string) => location.pathname.includes(`/${to}`)

  if (isLoading) return <div />
  if (user?.role === 'patient') return <div />

  const items = ALL_ITEMS.filter(item => user?.role && item.roles.includes(user.role))

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
  )
}

export default SystemNavbar