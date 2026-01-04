// src/pages/public/HomePage.jsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Added
import styles from './HomePage.module.css';
import InstallationsSlider from '../../modules/marketing/components/InstallationsSlider';
import CompanyInfo from '../../modules/marketing/components/CompanyInfo';

function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>{t('home.hero.title')}</h1>
          <p className={styles.subtitle}>{t('home.hero.subtitle')}</p>
          <Link to="/catalogue" className={styles.ctaButton}>{t('home.hero.cta')}</Link>
        </div>
      </section>

      <InstallationsSlider />
      
      <CompanyInfo />
    </>
  );
}

export default HomePage;


