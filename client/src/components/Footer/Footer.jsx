import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <h2 className="footer-logo">CASAWAVE</h2>
            <p className="footer-desc">
              Modern online store inspired by Casablanca energy and new generation creativity.
            </p>
            <div className="footer-socials">
              <a href="#"><i className="fa-brands fa-instagram"></i></a>
              <a href="#"><i className="fa-brands fa-tiktok"></i></a>
              <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
            </div>
          </div>

          <div className="footer-links-grid">
            <div className="footer-col">
              <h4>WHY CASAWAVE</h4>
              <Link to="/products">Quality products</Link>
              <Link to="/products">Clean shopping experience</Link>
              <Link to="/products">Designed for everyday life</Link>
            </div>
            <div className="footer-col">
              <h4>DISCOVER</h4>
              <Link to="/about">Our Story</Link>
              <Link to="/products">Shop Products</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>

          <div className="footer-newsletter">
            <h4>CONTACT</h4>
            <p>Have a question, a project idea, or just want to say hello? Feel free to reach out.</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 CASAWAVE. ALL RIGHTS RESERVED.</p>
          <div className="footer-legal">
            <Link to="/">Privacy Policy</Link>
            <Link to="/">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
