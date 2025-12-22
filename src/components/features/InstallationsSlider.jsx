// src/components/features/InstallationsSlider.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getInstallations } from '../../services/db';
import styles from './InstallationsSlider.module.css';

function InstallationsSlider() {
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    async function fetchInstallations() {
      try {
        const data = await getInstallations();
        setInstallations(data);
      } catch (error) {
        console.error('Erreur chargement installations:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchInstallations();
  }, []);

  // Auto-scroll every 4 seconds
  useEffect(() => {
    if (installations.length <= 1) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % installations.length);
    }, 4000);

    return () => clearInterval(autoPlayRef.current);
  }, [installations.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    // Reset auto-play timer when manually navigating
    clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % installations.length);
    }, 4000);
  };

  const nextSlide = () => {
    goToSlide((currentIndex + 1) % installations.length);
  };

  const prevSlide = () => {
    goToSlide((currentIndex - 1 + installations.length) % installations.length);
  };

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.placeholder}>
            <div className={styles.loader}></div>
          </div>
        </div>
      </section>
    );
  }

  if (installations.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.galleryHeader}>
          <span className={styles.headerLine}></span>
          <h2 className={styles.sectionTitle}>Nos Réalisations</h2>
          <span className={styles.headerLine}></span>
        </div>

        <div className={styles.sliderWrapper}>
          <button 
            className={`${styles.navButton} ${styles.prevButton}`} 
            onClick={prevSlide}
            aria-label="Image précédente"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>

          <div className={styles.slider} ref={sliderRef}>
            <div 
              className={styles.slidesTrack}
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {installations.map((installation, index) => (
                <div key={installation.id} className={styles.slide}>
                  <div className={styles.imageFrame}>
                    <img
                      src={installation.imageUrl}
                      alt={installation.title || `Réalisation ${index + 1}`}
                      className={styles.slideImage}
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                    <div className={styles.imageShine}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            className={`${styles.navButton} ${styles.nextButton}`} 
            onClick={nextSlide}
            aria-label="Image suivante"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>

        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${((currentIndex + 1) / installations.length) * 100}%` }}
            ></div>
          </div>
          <span className={styles.progressText}>
            {String(currentIndex + 1).padStart(2, '0')} / {String(installations.length).padStart(2, '0')}
          </span>
        </div>

        <Link to="/realisations" className={styles.viewAllButton}>
          <span>Explorer la Galerie</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12,5 19,12 12,19"></polyline>
          </svg>
        </Link>
      </div>
    </section>
  );
}

export default InstallationsSlider;
