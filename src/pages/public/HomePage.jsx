import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import InstallationsSlider from '../../components/features/InstallationsSlider';
import CompanyInfo from '../../components/features/CompanyInfo';

function HomePage() {
  return (
    <div className="container">
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>L'Élégance de la Sécurité</h1>
          <p className={styles.subtitle}>Découvrez notre collection exclusive de portes blindées et d'intérieur. Conçues pour durer, dessinées pour impressionner.</p>
          <Link to="/catalogue" className={styles.ctaButton}>Voir le Catalogue</Link>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featureCard}>
          <span className={styles.featureIcon}>🛡️</span>
          <h3 className={styles.featureTitle}>Sécurité Maximale</h3>
          <p>Nos portes blindées offrent une résistance certifiée contre les effractions, pour votre tranquillité d'esprit.</p>
        </div>
        <div className={styles.featureCard}>
          <span className={styles.featureIcon}>✨</span>
          <h3 className={styles.featureTitle}>Design Sur Mesure</h3>
          <p>Chaque intérieur est unique. Nos designs s'adaptent à votre style, du classique au contemporain.</p>
        </div>
        <div className={styles.featureCard}>
          <span className={styles.featureIcon}>🛠️</span>
          <h3 className={styles.featureTitle}>Installation Expert</h3>
          <p>Notre équipe qualifiée assure une pose parfaite et des finitions soignées pour un résultat impeccable.</p>
        </div>
      </section>

      <InstallationsSlider />
      
      <CompanyInfo />
    </div>
  );
}

export default HomePage;


