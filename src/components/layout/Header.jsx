// src/components/layout/Header.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>GAD<span>DOORS</span></Link>
      
      <button 
        className={`${styles.hamburger} ${isMenuOpen ? styles.active : ''}`}
        onClick={toggleMenu}
        aria-label="Menu"
        aria-expanded={isMenuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={`${styles.nav} ${isMenuOpen ? styles.menuOpen : ''}`}>
        <ul className={styles.navList}>
          <li><Link to="/" className={styles.navLink} onClick={closeMenu}>Accueil</Link></li>
          <li><Link to="/catalogue" className={styles.navLink} onClick={closeMenu}>Catalogue</Link></li>
          <li><Link to="/realisations" className={styles.navLink} onClick={closeMenu}>Nos Réalisations</Link></li>
          <li><Link to="/contact" className={styles.navLink} onClick={closeMenu}>Contact</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
