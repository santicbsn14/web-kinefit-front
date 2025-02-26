import ruso from '../Imagenes/ruso.png'
import joaquin from '../Imagenes/joaquin.png'
import frenteKinefit from '../Imagenes/frenteKinefit.png'

const Home = () :JSX.Element =>{
    return (
    <div>
        <h1 style={{marginTop:'10px', color:'#978f7f'}}> Bienvenidos a kinefit!</h1>
        <div className="imagenes-home" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
            <img src={ruso} alt="" style={{width:'300px', height:'300px', padding:'10px'}} />
            <img src={frenteKinefit} alt="" style={{width:'300px', height:'300px', padding:'10px'}} />
            <img src={joaquin} alt="" style={{width:'300px', height:'300px', padding:'10px'}} />
        </div>
       
        
    </div>
    )
}
export default Home