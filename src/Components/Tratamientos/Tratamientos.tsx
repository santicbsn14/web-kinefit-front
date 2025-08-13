import './tratamientos.css';
import mep from '../Imagenes/mep.png';
import plantillas from '../Imagenes/plantillas.png';
import ventosas from '../Imagenes/ventosas.png';

type Tratamiento = {
  src: string;
  title: string;
  items: string[];
};

const DATA: Tratamiento[] = [
  {
    src: mep,
    title: 'MEP / Neuromodulación',
    items: [
      'Disminución del dolor y contracturas',
      'Estimulación neuromuscular focal',
      'Acompaña la readaptación funcional',
    ],
  },
  {
    src: plantillas,
    title: 'Estudio de pisada y plantillas',
    items: [
      'Análisis estático y dinámico',
      'Plantillas personalizadas',
      'Prevención de sobrecargas y lesiones',
    ],
  },
  {
    src: ventosas,
    title: 'Cupping / Ventosas',
    items: [
      'Mejora circulatoria local',
      'Descarga miofascial',
      'Recuperación post-esfuerzo',
    ],
  },
];

const Tratamientos = (): JSX.Element => {
  return (
    <main className="tr">
      {/* HERO */}
      <section className="section-title">
        <span className="eyebrow">NUESTROS SERVICIOS</span>
        <h1 className="page-title">Tratamientos</h1>
        <p className="subtitle">
          Técnicas y herramientas para evaluar, tratar y acompañar tu recuperación.
          Elegimos lo que mejor se adapta a tu objetivo y etapa del proceso.
        </p>
      </section>

      {/* GRID */}
      <section className="tr__grid">
        {DATA.map((t) => (
          <article className="tr__card" key={t.title}>
            <div className="tr__media">
              <img src={t.src} alt={t.title} loading="lazy" />
              <div className="tr__mediaShade" />
            </div>
            <div className="tr__body">
              <h3>{t.title}</h3>
              <ul className="tr__list">
                {t.items.map((li, i) => (
                  <li key={i}>{li}</li>
                ))}
              </ul>
              <div className="tr__actions">
                <a className="tr__btn" href="#contacto">Consultar</a>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default Tratamientos;
