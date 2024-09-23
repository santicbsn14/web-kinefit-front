import * as React from 'react'
import './mainSystem.css'
import { getAuth } from 'firebase/auth'
const MainSystem = () :JSX.Element => {
    const email = getAuth().currentUser?.email
 return(
     <div className='mainSystem'>
         <h3 style={{marginTop:'3rem', color:'grey'}}>Bienvenido {email}, que tengas buena jornada!</h3>
     </div>
 )   
}
export default MainSystem