import joacoYruso from '../Imagenes/rusoYjoaco.png';
import './Quienessomos.css'
const QuienesSomos = (): JSX.Element => {
  return (
    <section className="qs">
      <div className="qs__wrap">
        {/* Imagen / héroe */}
        <div className="qs__col qs__col--image">
          <div className="qs__photo">
            <img src={joacoYruso} alt="Equipo Kinefit en acción" loading="lazy" />
            <span className="qs__badge">
              <i className="fa-solid fa-star"></i> Kinefit
            </span>
          </div>
        </div>

        {/* Texto */}
        <div className="qs__col qs__col--text">
          <h1 className="qs__title">
            Somos <span>Kinefit</span>
          </h1>
          <p className="qs__lead">
            Rehabilitación y movimiento basados en evidencia, con calidez humana. Acompañamos cada proceso con objetivos claros, educación del paciente y resultados medibles.
          </p>

          <ul className="qs__bullets">
            <li>
              <i className="fa-solid fa-user-doctor"></i>
              <span>Equipo de kinesiólogos especializados y en formación continua.</span>
            </li>
            <li>
              <i className="fa-solid fa-dumbbell"></i>
              <span>Planificación de recuperación y rendimiento, paso a paso.</span>
            </li>
            <li>
              <i className="fa-solid fa-heart-pulse"></i>
              <span>Seguimiento cercano y herramientas para prevenir recaídas.</span>
            </li>
          </ul>

          <div className="qs__stats">
            <div><strong>+8</strong><span>Años de experiencia</span></div>
            <div><strong>+1200</strong><span>Pacientes atendidos</span></div>
            <div><strong>+10</strong><span>Especialidades</span></div>
          </div>
        </div>
      </div>

      {/* Cards breves */}
      <div className="qs__cards">
        <div className="qs-card">
          <h3><i className="fa-solid fa-bullseye"></i> Misión</h3>
          <p>Ayudarte a volver a moverte sin dolor, con planes claros y centrados en vos.</p>
        </div>
        <div className="qs-card">
          <h3><i className="fa-solid fa-lightbulb"></i> Visión</h3>
          <p>Ser referencia regional en rehabilitación deportiva y terapias manuales.</p>
        </div>
        <div className="qs-card">
          <h3><i className="fa-solid fa-hand-holding-heart"></i> Valores</h3>
          <p>Empatía, evidencia científica, trabajo en equipo y resultados reales.</p>
        </div>
      </div>
    </section>
  );
};

export default QuienesSomos;
