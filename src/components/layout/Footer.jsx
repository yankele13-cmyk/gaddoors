// src/components/layout/Footer.jsx
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.column}>
          <h3>GAD DOORS</h3>
          <p>L'excellence de la menuiserie pour votre intérieur. Design, sécurité et sur-mesure.</p>
        </div>
        <div className={styles.column}>
          <h3>Contact</h3>
          <p>Téléphone : +972 55-278-3693</p>
          <p>Email : yankele13@gmail.com</p>
          <p>Adresse : Aaron Eskoli 115,jerusalem</p>
        </div>
        <div className={styles.column}>
          <h3>Liens Rapides</h3>
          <a href="/catalogue">Catalogue</a>
          <a href="/realisations">Réalisations</a>
          <a href="/contact">Contact</a>
        </div>
      </div>
      <div className={styles.copyright}>
        <p>&copy; 2025 Gad Doors. Tous droits réservés.</p>
      </div>
    </footer>
  );
}

export default Footer;
