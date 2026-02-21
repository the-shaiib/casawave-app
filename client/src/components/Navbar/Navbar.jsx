import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount } = useStore();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/">CASAWAVE</Link>
        </div>

        <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
          <li><Link to="/products" onClick={() => setIsOpen(false)}>Products</Link></li>
          <li><Link to="/about" onClick={() => setIsOpen(false)}>About</Link></li>
          <li><Link to="/contact" onClick={() => setIsOpen(false)}>Contact</Link></li>
        </ul>

        <div className="nav-actions">
          <Link to="/admin" className="icon-btn">
            <i className="fa-solid fa-user"></i>
          </Link>

          <Link to="/orders" className="cart-wrapper" onClick={() => setIsOpen(false)}>
            <i className="fa-solid fa-bag-shopping"></i>
            <span className="cart-badge">{cartCount}</span>
          </Link>

          <div className="mobile-menu" onClick={toggleMenu}>
            <i className={isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars-staggered'}></i>
          </div>
        </div>
      </div>

      {isOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}
    </nav>
  );
}

export default Navbar;
