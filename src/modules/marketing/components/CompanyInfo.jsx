// src/components/features/CompanyInfo.jsx
import { useTranslation, Trans } from 'react-i18next'; // Added
import styles from './CompanyInfo.module.css';

function CompanyInfo() {
  const { t } = useTranslation();

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>{t('home.company.title')}</h2>
        <p className={styles.sectionSubtitle}>
          {t('home.company.subtitle')}
        </p>

        <div className={styles.infoGrid}>
          {/* Garanties */}
          <div className={styles.infoCard}>
            <span className={styles.icon}>🛡️</span>
            <h3 className={styles.cardTitle}>{t('home.company.guarantee.title')}</h3>
            <ul className={styles.list}>
              <li>{t('home.company.guarantee.mech')}</li>
              <li>{t('home.company.guarantee.water')}</li>
            </ul>
          </div>

          {/* Processus */}
          <div className={styles.infoCard}>
            <span className={styles.icon}>📋</span>
            <h3 className={styles.cardTitle}>{t('home.company.process.title')}</h3>
            <ul className={styles.list}>
              <li>{t('home.company.process.visit')}</li>
              <li>{t('home.company.process.advice')}</li>
              <li>{t('home.company.process.quote')}</li>
              <li>{t('home.company.process.delivery')}</li>
            </ul>
            <p className={styles.note}>{t('home.company.process.note')}</p>
          </div>

          {/* Spécialités */}
          <div className={styles.infoCard}>
            <span className={styles.icon}>🚪</span>
            <h3 className={styles.cardTitle}>{t('home.company.specialties.title')}</h3>
            <ul className={styles.list}>
              <li>{t('home.company.specialties.mamad')}</li>
              <li>{t('home.company.specialties.import')}</li>
              <li>{t('home.company.specialties.quality')}</li>
            </ul>
          </div>

          {/* Serrures */}
          <div className={styles.infoCard}>
            <span className={styles.icon}>🔐</span>
            <h3 className={styles.cardTitle}>{t('home.company.locks.title')}</h3>
            <ul className={styles.list}>
              <li>{t('home.company.locks.key')}</li>
              <li>{t('home.company.locks.butterfly')}</li>
              <li>{t('home.company.locks.cyl')}</li>
              <li>{t('home.company.locks.mag')}</li>
              <li>{t('home.company.locks.wc')}</li>
            </ul>
          </div>
        </div>

        <div className={styles.experience}>
          <p className={styles.experienceText}>
              <strong>{t('home.company.experienceLabel')}</strong> {t('home.company.experienceText')}
          </p>
        </div>
      </div>
    </section>
  );
}

export default CompanyInfo;
