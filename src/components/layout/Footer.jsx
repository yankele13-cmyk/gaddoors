// src/components/layout/Footer.jsx
import { useTranslation } from 'react-i18next';
import styles from './Footer.module.css';

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.column}>
          <h3>GAD DOORS</h3>
          <p>{t('footer.about')}</p>
        </div>
        <div className={styles.column}>
          <h3>{t('footer.contact.title')}</h3>
          <p>{t('footer.contact.phone')} : +972 55-278-3693</p>
          <p>{t('footer.contact.email')} : yankele13@gmail.com</p>
          <p>{t('footer.contact.address')} : Aaron Eshkoli 115, Jerusalem</p>
        </div>
        <div className={styles.column}>
          <h3>{t('footer.links.title')}</h3>
          <a href="/catalogue">{t('footer.links.catalogue')}</a>
          <a href="/realisations">{t('footer.links.realisations')}</a>
          <a href="/contact">{t('footer.links.contact')}</a>
        </div>
      </div>
      <div className={styles.copyright}>
        <p>{t('footer.rights')}</p>
      </div>
    </footer>
  );
}

export default Footer;
