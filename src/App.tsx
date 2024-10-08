import './App.css'
import Home from './Components/Home/Home'
import NavBar from './Components/NavBar/NavBar'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Tratamientos from './Components/Tratamientos/Tratamientos'
import QuienesSomos from './Components/QuienesSomos/Quienes_Somos'
import ObrasSociales from './Components/ObrasSociales/Obras_Sociales'
import LoginComponent from './Components/Sistema/ViewLogin'
import MainSystem from './Components/Sistema/MainSystem'
import Agenda from './Components/Sistema/SystemComponents/Agenda/Agenda'
import DashboardLayout from './Components/Sistema/DashboardLayout'
import Users from './Components/Sistema/SystemComponents/Users/Users'
import Patients from './Components/Sistema/SystemComponents/Patients/Patients'
import Professionals from './Components/Sistema/SystemComponents/Professionals/Professionals'
import Appointments from './Components/Sistema/SystemComponents/Appointments/Appointments'
import ProtectedRoute from './Contexts/protectedRoute'
import { AuthProvider } from './Contexts/authContext'
import PatientDashboard from './Components/Sistema/SystemComponents/PatientDashboard/PatientDashboard'
function App() {
  return (
    <AuthProvider>
      <div className='open-sans'>
        <BrowserRouter>
          <NavBar></NavBar>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/tratamientos' element={<Tratamientos/>}/>
            <Route path='/quienesSomos' element={<QuienesSomos/>}/>
            <Route path='/obrasSociales' element={<ObrasSociales/>}/>
            <Route path='/login' element={<LoginComponent/>}/>
            <Route element={<ProtectedRoute/>}>
              <Route path='/system' element={<DashboardLayout />}>
                <Route index element={<MainSystem />} />
                <Route path='agenda' element={<Agenda />} />
                <Route path='users' element={<Users/>}/>
                <Route path='professionals' element={<Professionals/>}/>
                <Route path='appointments' element={<Appointments/>}/>
                <Route path='patients' element={<Patients/>}/>
                <Route path='patient-dashboard' element={<PatientDashboard />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  )
}

export default App