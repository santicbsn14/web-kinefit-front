import'../Tratamientos/tratamientos.css'
import mutual from '../Imagenes/mutual_gsn.webp'
import mutual2 from '../Imagenes/mutual_britanica.webp'
import mutual3 from '../Imagenes/mutual_osde.webp'
import mutual4 from '../Imagenes/mutualAc.webp'
import mutual5 from '../Imagenes/mutual_osap.webp'
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
                <div className="col-lg-4 col-md-12 col-sm-12 mx-auto" style={{position:'relative'}}>
                        <img src={mutual4} className="imgMain" alt="" />
                </div>
                <div className="col-lg-4 col-md-12 col-sm-12 mx-auto" style={{position:'relative'}}>
                        <img src={mutual5} className="imgMain" alt="" />
                </div>
        </div>
</main>
    )
}
export default ObrasSociales