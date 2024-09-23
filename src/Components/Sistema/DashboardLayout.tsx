import { Outlet } from 'react-router-dom';
import SystemNavbar from './SystemComponents/SystemNavbar';

const DashboardLayout = () => {
  return (
    <div>
      <SystemNavbar/> {/* Navbar exclusiva para el sistema */}
      <div className="content">
        <Outlet /> {/* Aquí se renderizan las rutas hijas */}
      </div>
    </div>
  );
};

export default DashboardLayout;