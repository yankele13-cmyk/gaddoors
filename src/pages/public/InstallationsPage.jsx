// src/pages/public/InstallationsPage.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Added
import SEO from '../../components/SEO';
import { getInstallations } from '../../services/db';
import styles from './InstallationsPage.module.css';


function InstallationsPage() {
  const { t } = useTranslation();
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchInstallations() {
      try {
        setLoading(true);
        const installationList = await getInstallations();
        setInstallations(installationList);
      } catch (err) {
        setError(t('installations.error'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchInstallations();
  }, [t]);

  if (loading) {
    return (
      <div className={styles.pageContainer}>
         <SEO title={t('installations.title', 'Réalisations')} />
         <div className={styles.loadingContainer}>
            <div className={styles.loader}></div>
         </div>
      </div>
    );
  }

  if (error) {
     return (
        <div className={styles.pageContainer}>
            <SEO title={t('installations.title', 'Réalisations')} />
            <div className={styles.errorContainer}>
               <p className={styles.errorMessage}>{error}</p>
            </div>
        </div>
     );
  }

  return (
    <div className={styles.pageContainer}>
      <SEO 
        title={t('installations.seo.title', 'Nos Réalisations')} 
        description={t('installations.seo.description', 'Découvrez nos installations de portes de garage et portes intérieures en images.')} 
      />
      <div className={styles.header}>
        <span className={styles.headerLine}></span>
        <h1 className={styles.pageTitle}>{t('installations.title')}</h1>
        <span className={styles.headerLine}></span>
      </div>

      <div className="max-w-4xl mx-auto text-center mb-12 px-4">
         <h2 className="text-2xl font-heading text-[#d4af37] mb-4">{t('installations.seo_content.title')}</h2>
         <p className="text-gray-300 mb-4">{t('installations.seo_content.text1')}</p>
         <p className="text-gray-400 text-sm italic">{t('installations.seo_content.text2')}</p>
      </div>

      
      <div className={styles.galleryGrid}>
        {installations.map((installation, index) => (
          <div 
             key={installation.id} 
             className={styles.galleryItem}
             style={{ animationDelay: `${index * 0.1}s` }}
          >
             <div className={styles.imageFrame}>
               <img 
                 src={installation.imageUrl} 
                 alt={installation.title || `Réalisation ${index + 1}`} 
                 className={styles.galleryImage} 
                 loading="lazy"
               />
               <div className={styles.imageShine}></div>
             </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12 mb-8">
          <p className="text-white mb-4">Vous aimez nos réalisations ?</p>
          <div className="flex justify-center gap-6">
                 <a href="/catalogue" className="px-6 py-2 border border-[#d4af37] text-[#d4af37] rounded hover:bg-[#d4af37] hover:text-black transition">
                    Voir le catalogue
                 </a>
                 <a href="/contact" className="px-6 py-2 bg-[#d4af37] text-black rounded hover:bg-white transition">
                    Demander un devis
                 </a>
          </div>
      </div>
    </div>
  );
}

export default InstallationsPage;
