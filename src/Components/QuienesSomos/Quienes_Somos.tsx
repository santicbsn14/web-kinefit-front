import joacoYruso from'../Imagenes/rusoYjoaco.png'
const QuienesSomos = () :JSX.Element => {
    return ( 
        <div className="container-fluid" style={{marginTop:'3rem', marginLeft:'60px'}}>
            <div className="row" style={{display:'flex'}}>
                <img className='col-lg-6' src={joacoYruso} style={{width:'500px', height:'600'}} alt="" />
                <div className="col-lg-6" style={{marginTop:'8rem'}}>
                    <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Odio laborum sed quas eveniet quae voluptatum incidunt at rerum error nemo! Eaque, obcaecati debitis accusamus dolore sint consequatur maiores dolor enim.</p>
                    <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Odio laborum sed quas eveniet quae voluptatum incidunt at rerum error nemo! Eaque, obcaecati debitis accusamus dolore sint consequatur maiores dolor enim.</p>
                </div>
            </div>
        </div>
    )
}
export default QuienesSomos