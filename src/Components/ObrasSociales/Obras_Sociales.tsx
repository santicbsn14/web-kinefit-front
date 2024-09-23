import'../Tratamientos/tratamientos.css'
import mutual from '../Imagenes/medife.jpg'
import mutual2 from '../Imagenes/mutual2.jpg'
import mutual3 from '../Imagenes/mutual3.jpg'
const ObrasSociales = () :JSX.Element => {
    return (
        <main style={{ marginTop: '3rem' }} className="container-fluid mainSports">
        <div className="row">
                <div className="col-lg-4 col-md-12 col-sm-12 mx-auto" style={{position:'relative'}}>
                        <img src={mutual} className="imgMain" alt="" />
                </div>
                <div className="col-lg-4 col-md-12 col-sm-12 mx-auto" style={{position:'relative'}}>
                        <img src={mutual2} className="imgMain" alt="" />
                </div>
                <div className="col-lg-4 col-md-12 col-sm-12 mx-auto" style={{position:'relative'}}>
                        <img src={mutual3} className="imgMain" alt="" />
                </div>
        </div>
</main>
    )
}
export default ObrasSociales