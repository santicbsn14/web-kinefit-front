import './contact.css';

const ContactForm = (): JSX.Element => {
  return (
    <main className="contact-container">
      {/* Encabezado */}
      <section className="head">
        <p className="eyebrow">Contacto</p>
        <h1 className="title">Contactanos</h1>
        <p className="subtitle">
          España 71, B2900 DMJ, Provincia de Buenos Aires, Argentina ·
          <strong> 0336 445-4540</strong>
        </p>
      </section>

      {/* Grid: Mapa + Formulario */}
      <section className="contact-grid">
        {/* Columna izquierda: Mapa + datos */}
        <aside className="card map-card">
          <div className="map-wrap">
            <iframe
              title="Ubicación Kinefit"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3333.499805275488!2d-60.21312398850966!3d-33.33188999133971!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b75d6287796d4d%3A0x1c91590ca5aa5c7c!2sEspa%C3%B1a%2071%2C%20B2900%20San%20Nicol%C3%A1s%20de%20Los%20Arroyos%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1731510763662!5m2!1ses!2sar"
            />
          </div>

          <ul className="contact-list">
            <li>
              <i className="fa-solid fa-location-dot" />
              España 71, San Nicolás de los Arroyos (B2900), Buenos Aires
            </li>
            <li>
              <i className="fa-solid fa-phone" />
              0336 445-4540
            </li>
            <li>
              <i className="fa-solid fa-clock" />
              Lun a Vie · 8:00–19:00
            </li>
          </ul>
        </aside>

        {/* Columna derecha: Formulario */}
        <form
          className="card form-card"
          onSubmit={(e) => {
            e.preventDefault();
            // Acá luego podés disparar tu fetch/email/toast
            alert('¡Mensaje enviado!');
          }}
        >
          <div className="form-grid">
            <div className="field">
              <label htmlFor="nombre">Nombre y apellido</label>
              <input id="nombre" type="text" placeholder="Tu nombre completo" required />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="tucorreo@ejemplo.com" required />
            </div>

            <div className="field field-full">
              <label htmlFor="mensaje">Mensaje</label>
              <textarea
                id="mensaje"
                placeholder="Contanos en qué podemos ayudarte"
                rows={6}
                required
              />
            </div>
          </div>

          <div className="actions">
            <button className="btn-primary" type="submit">Enviar</button>
            <a
              className="btn-ghost"
              href="https://wa.me/5493364454540"
              target="_blank"
              rel="noreferrer"
            >
              <i className="fa-brands fa-whatsapp" />
              WhatsApp
            </a>
          </div>
        </form>
      </section>
    </main>
  );
};

export default ContactForm;
