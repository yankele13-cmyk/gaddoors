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
          <p className="!flex !items-center gap-2 justify-start">
            <span>{t('footer.contact.phone')} :</span>
            <a href="tel:+972552783693" dir="ltr" className="hover:text-[#d4af37] transition-colors">+972 55-278-3693</a>
          </p>
          <p className="!flex !items-center gap-2 justify-start">
            <span>{t('footer.contact.email')} :</span>
            <a href="mailto:contact@gaddoors.com" dir="ltr" className="hover:text-[#d4af37] transition-colors">contact@gaddoors.com</a>
          </p>
          <p className="!flex !items-start gap-2 justify-start">
            <span className="shrink-0">{t('footer.contact.address')} :</span>
            <a href="https://www.google.com/maps/search/?api=1&query=Aaron+Eshkoli+115+Jerusalem" target="_blank" rel="noopener noreferrer" className="hover:text-[#d4af37] transition-colors">Aaron Eshkoli 115, Jerusalem</a>
          </p>
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
