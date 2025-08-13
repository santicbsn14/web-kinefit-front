import { Link } from 'react-router-dom';
import logo from '../Imagenes/logo_kinefit.webp';
import './footer.css';

const Footer = (): JSX.Element => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="ft-stripe" />

      <div className="ft-inner">
        {/* Brand */}
        <div className="ft-col ft-brand">
          <div className="ft-logoWrap">
            <img src={logo} alt="Kinefit" />
            <span>Kinefit</span>
          </div>
          <p className="ft-copy">
            Kinesiología y rehabilitación con foco en movimiento, evidencia y calidez humana.
          </p>

          <div className="ft-social">
            <a className="ft-ico" href="https://wa.me/5493364454540" target="_blank" rel="noreferrer" aria-label="WhatsApp" title="WhatsApp">
              <i className="fa-brands fa-whatsapp" />
            </a>
            <a className="ft-ico" href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram">
              <i className="fa-brands fa-instagram" />
            </a>
            <a className="ft-ico" href="mailto:contacto@kinefit.com" aria-label="Email" title="Email">
              <i className="fa-solid fa-envelope" />
            </a>
          </div>
        </div>

        {/* Navegación */}
        <div className="ft-col ft-links">
          <h4>Navegación</h4>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/tratamientos">Tratamientos</Link></li>
            <li><Link to="/obrasSociales">Obras Sociales</Link></li>
            <li><Link to="/quienesSomos">Quiénes Somos</Link></li>
            <li><Link to="/contact">Contacto</Link></li>
          </ul>
        </div>

        {/* Contacto */}
        <div className="ft-col ft-contact">
          <h4>Contacto</h4>
          <ul className="ft-contactList">
            <li><i className="fa-solid fa-location-dot" /> España 71, San Nicolás (B2900), Buenos Aires</li>
            <li><i className="fa-solid fa-phone" /> 0336 445-4540</li>
            <li><i className="fa-solid fa-clock" /> Lun a Vie · 8:00–19:00</li>
          </ul>

          <a className="ft-btnOutline" href="https://wa.me/5493364454540" target="_blank" rel="noreferrer">
            <i className="fa-brands fa-whatsapp" />
            Escribinos por WhatsApp
          </a>
        </div>
      </div>

      <div className="ft-bottom">
        <span>© {year} Kinefit</span>
        <span className="ft-dot" />
        <span>
          Desarrollado por{' '}
          <a href="https://www.linkedin.com/in/santiagoviale" target="_blank" rel="noreferrer">
            Santiago Viale Sistemas
          </a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
