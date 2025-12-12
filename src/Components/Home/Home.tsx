import './Home.css';
import ruso from '../Imagenes/ruso.png';
import joaquin from '../Imagenes/Mariana-Home.webp';
import frenteKinefit from '../Imagenes/frenteKinefit.png';

const Home = (): JSX.Element => {
  return (
    <>
      {/* HERO */}
      <section className="home-hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">kinesiología · rehabilitación</span>
            <h1>Bienvenidos a <span>kinefit</span></h1>
            <p>
              Movimiento, ciencia y calidez humana. Evaluamos, planificamos y
              acompañamos tu recuperación con objetivos claros y medibles.
            </p>
            <div className="hero-ctas">
              {/* cambiá los href si querés */}
              <a href="/contact" className="btn btn-primary">
                {/* <i className="fa-solid fa-calendar-check" /> */} Reservar turno
              </a>
              <a
                href="https://wa.me/5490000000000"
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
              >
                {/* <i className="fa-brands fa-whatsapp" /> */} WhatsApp
              </a>
            </div>
          </div>

          {/* Collage de imágenes */}
          <div className="hero-media">
            <img src={joaquin} alt="Frente de Kinefit" className="tile tile-a" />
            <img src={ruso} alt="German Aseff" className="tile tile-b" />
            <img src={frenteKinefit} alt="Joaquín Viale" className="tile tile-c" />
          </div>
        </div>
      </section>

      {/* Highlights cortitos */}
      <section className="home-feature-row">
        <article className="feature-card">
          <h3>Evaluación y objetivos</h3>
          <p>Plan personalizado basado en evidencia y en tu contexto real.</p>
        </article>
        <article className="feature-card">
          <h3>Seguimiento cercano</h3>
          <p>Feedback, ajustes y educación del paciente en cada etapa.</p>
        </article>
        <article className="feature-card">
          <h3>Equipo & tecnología</h3>
          <p>MEP, plantillas, cupping y + herramientas para acelerar tu rehab.</p>
        </article>
      </section>
    </>
  );
};

export default Home;
