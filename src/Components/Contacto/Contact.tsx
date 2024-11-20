import  { useState } from 'react';
import './contact.css'
const ContactForm = () => {
    const [enConstruccion, setEnConstruccion] = useState(true);
    if (enConstruccion) {
      setEnConstruccion(true)
        return (
          <div style={{ textAlign: 'center', marginTop: '20px', color: 'white' }}>
            Estamos en la construcción de esta vista...
          </div>
        );
      }
  return (
    <main className="mt-56 mainContact"> {/* mainContact equivalent */}
      <section className="container-fluid my-3">
        <div className="row">
          {/* Left Column */}
          <div className="col-lg-5 col-md-12 col-sm-12">
            <h3 style={{color:'white'}}className=" text-2xl">Contactanos</h3>
            <h6 style={{color:'white'}}>España 71,B2900 DMJ, Provincia BS AS, Argentina</h6>
            <h6 style={{color:'white'}}>0336 445-4540</h6>
            <iframe 
              className="w-[400px] relative left-0"
              style={{border:'0', width:"150", height:"450"}}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3333.499805275488!2d-60.21312398850966!3d-33.33188999133971!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b75d6287796d4d%3A0x1c91590ca5aa5c7c!2sEspa%C3%B1a%2071%2C%20B2900%20San%20Nicol%C3%A1s%20de%20Los%20Arroyos%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1731510763662!5m2!1ses!2sar"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Right Column */}
          <div style={{marginTop:'42px'}} className="col-lg-7 col-md-12 col-sm-12 ">
          <form className="row w-[90%] md:pb-32 lg:pb-0 text-start">
              <div className="col-lg-6 col-md-12 col-sm-12">
                <label htmlFor="inputEmail4" className="form-label text-white">
                  Nombre y apellido
                </label>
                <input
                  style={{ marginLeft:'0px', width:'302px'}}  
                  type="text" 
                  className="form-control" 
                  id="inputEmail4"
                />
              </div>

              <div className="col-lg-6 col-md-12 col-sm-12">
                <label style={{ marginLeft:'-82px'}} htmlFor="inputEmail" className="form-label text-white">
                  Email
                </label>
                <input
                  style={{ marginLeft:'-82px', width:'302px'}}  
                  type="email" 
                  className="form-control" 
                  id="inputEmail"
                />
              </div>


              <div className="col-12 col-md-12 col-sm-12 my-1">
                <label htmlFor="inputMensaje" className="form-label text-white">
                  Mensaje
                </label>
                <input
                  style={{ width:'80%', marginLeft:'0px'}} 
                  type="text" 
                  className="form-control h-28 " 
                  id="inputMensaje"
                />
              </div>

              <div style={{marginTop:'1rem', marginLeft:'0px'}} className="col-12 col-md-12 col-sm-12">
                <button style={{marginLeft:'0px'}} type="submit" className="btn btnCards">
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactForm;