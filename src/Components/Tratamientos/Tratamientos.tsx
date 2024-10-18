import './tratamientos.css'
import mep from '../Imagenes/mep.png'
import plantillas from '../Imagenes/plantillas.png'
import ventosas from '../Imagenes/ventosas.png'
const Tratamientos = () :JSX.Element => {
    return (
            <main style={{ marginTop: '3rem' }} className="container-fluid mainSports">
                    <div className="row">
                            <div className="col-lg-4 col-md-12 col-sm-12 mx-auto" style={{position:'relative'}}>
                                    <img src={mep} className="imgMain" alt="" />
                                    <ul className="items-list" >
                                            <li style={{color:'#978f7f'}}>Ítem 1 para la primera imagen</li>
                                            <li style={{color:'#978f7f'}}>Ítem 2 para la primera imagen</li>
                                            <li style={{color:'#978f7f'}}>Ítem 3 para la primera imagen</li>
                                    </ul>
                            </div>
                            <div className="col-lg-4 col-md-12 col-sm-12 mx-auto" style={{position:'relative'}}>
                                    <img src={plantillas} className="imgMain" alt="" />
                                    <ul className="items-list ">
                                            <li style={{color:'#978f7f'}}>Ítem 1 para la segunda imagen</li>
                                            <li style={{color:'#978f7f'}}>Ítem 2 para la segunda imagen</li>
                                            <li style={{color:'#978f7f'}}>Ítem 3 para la segunda imagen</li>
                                    </ul>
                            </div>
                            <div className="col-lg-4 col-md-12 col-sm-12 mx-auto" style={{position:'relative'}}>
                                    <img src={ventosas} className="imgMain" alt="" />
                                    <ul className="items-list ">
                                            <li style={{color:'#978f7f'}}>Ítem 1 para la tercera imagen</li>
                                            <li style={{color:'#978f7f'}}>Ítem 2 para la tercera imagen</li>
                                            <li style={{color:'#978f7f'}}>Ítem 3 para la tercera imagen</li>
                                    </ul>
                            </div>
                    </div>
            </main>
    )
}
export default Tratamientos