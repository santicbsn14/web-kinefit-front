import './obrasSociales.css';

import mutual     from '../Imagenes/mutual_gsn.webp';
import mutual2    from '../Imagenes/mutual_britanica.webp';
import mutual3    from '../Imagenes/mutual_osde.webp';
import mutual4    from '../Imagenes/mutualAc.webp';
import mutual5    from '../Imagenes/mutual_osap.webp';

type Provider = { src: string; name: string; note?: string };

const PROVEEDORES: Provider[] = [
  { src: mutual,  name: 'Club Belgrano / GSN',        note: 'Convenio' },
  { src: mutual2, name: 'Británica',                  note: 'A convenir' },
  { src: mutual3, name: 'OSDE',                       note: 'Reintegro' },
  { src: mutual4, name: 'Accord / AMR',               note: 'Convenio' },
  { src: mutual5, name: 'OSAP',                       note: 'Cobertura parcial' },
];

const ObrasSociales = (): JSX.Element => {
  return (
    <main className="os">
      {/* HERO */}
      <section className="os__hero">
        <h1>
          Obras sociales <span>y coberturas</span>
        </h1>
        <p>
          Trabajamos con las principales obras sociales y prepagas. Si la tuya no
          aparece en el listado, escribinos: podemos gestionar <b>reintegros</b> o
          alternativas para que no te quedes sin tratamiento.
        </p>
      </section>

      {/* GRID DE LOGOS */}
      <section className="os__grid">
        {PROVEEDORES.map((p, i) => (
          <article className="os__card" key={i} aria-label={p.name}>
            <div className="os__logoWrap">
              <img loading="lazy" src={p.src} alt={`Logo ${p.name}`} />
            </div>
            <div className="os__info">
              <h3 className="os__name">{p.name}</h3>
              {p.note && <span className="os__tag">{p.note}</span>}
            </div>
          </article>
        ))}
      </section>

      {/* CTA */}
      <section className="os__cta">
        <div className="os__ctaCard">
          <div>
            <h2>¿No encontrás tu obra social?</h2>
            <p>Consultanos por reintegros y convenios vigentes.</p>
          </div>
          <a className="os__btn" href="/contacto">
            Consultar cobertura
          </a>
        </div>
      </section>
    </main>
  );
};

export default ObrasSociales;
