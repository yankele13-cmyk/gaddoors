// src/pages/public/InstallationsPage.jsx
import { useState, useEffect } from 'react';
import { getInstallations } from '../../services/db';
import styles from './InstallationsPage.module.css';


function InstallationsPage() {
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
        setError("Impossible de charger les réalisations.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchInstallations();
  }, []);

  if (loading) {
    return (
      <div className={styles.pageContainer}>
         <div className={styles.loadingContainer}>
            <div className={styles.loader}></div>
         </div>
      </div>
    );
  }

  if (error) {
     return (
        <div className={styles.pageContainer}>
            <div className={styles.errorContainer}>
               <p className={styles.errorMessage}>{error}</p>
            </div>
        </div>
     );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <span className={styles.headerLine}></span>
        <h1 className={styles.pageTitle}>NOS RÉALISATIONS</h1>
        <span className={styles.headerLine}></span>
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
    </div>
  );
}

export default InstallationsPage;
