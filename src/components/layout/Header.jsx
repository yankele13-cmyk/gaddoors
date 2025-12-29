// src/components/layout/Header.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LanguageSelector from '../common/LanguageSelector';
import styles from './Header.module.css';

function Header() {
  const { t } = useTranslation();
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
          <li><Link to="/" className={styles.navLink} onClick={closeMenu}>{t('nav.home')}</Link></li>
          <li><Link to="/catalogue" className={styles.navLink} onClick={closeMenu}>{t('nav.catalogue')}</Link></li>
          <li><Link to="/realisations" className={styles.navLink} onClick={closeMenu}>{t('nav.realisations')}</Link></li>
          <li><Link to="/contact" className={styles.navLink} onClick={closeMenu}>{t('nav.contact')}</Link></li>
          <li><div className="flex items-center justify-center mt-4 md:mt-0 md:ml-4"><LanguageSelector variant="minimal" /></div></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
