import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import * as React from 'react'
import { useAuth } from './authContext';
const ProtectedRoute: React.FC = () => {
  const { user, loading} = useAuth();
  const location = useLocation();
  const navigate = useNavigate();


  React.useEffect(() => {
    if (!loading) {
      if (user) {
        console.log("ProtectedRoute - User authenticated");
      } else {
        navigate('/login', { state: { from: location }, replace: true });
      }
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return <div>Cargando...</div>;
  }
  
  if (!user) {
    return null; 
  }


  return <Outlet />;
};
export default ProtectedRoute