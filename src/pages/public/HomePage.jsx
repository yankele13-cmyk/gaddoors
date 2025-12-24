import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import InstallationsSlider from '../../components/features/InstallationsSlider';
import CompanyInfo from '../../components/features/CompanyInfo';

function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>L'Élégance de la Qualité</h1>
          <p className={styles.subtitle}>Découvrez notre collection exclusive de portes d'intérieur. Conçues pour durer, dessinées pour impressionner.</p>
          <Link to="/catalogue" className={styles.ctaButton}>Voir le Catalogue</Link>
        </div>
      </section>

      <InstallationsSlider />
      
      <CompanyInfo />
    </>
  );
}

export default HomePage;


