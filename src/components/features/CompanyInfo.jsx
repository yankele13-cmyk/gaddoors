// src/components/features/CompanyInfo.jsx
import styles from './CompanyInfo.module.css';

function CompanyInfo() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Pourquoi Nous Choisir ?</h2>
        <p className={styles.sectionSubtitle}>
          18 ans d'expérience dans l'importation et la pose de portes de qualité
        </p>

        <div className={styles.infoGrid}>
          {/* Garanties */}
          <div className={styles.infoCard}>
            <span className={styles.icon}>🛡️</span>
            <h3 className={styles.cardTitle}>Garanties Solides</h3>
            <ul className={styles.list}>
              <li>1 an de garantie sur les mécanismes</li>
              <li>7 ans de garantie contre l'eau et les termites</li>
            </ul>
          </div>

          {/* Processus */}
          <div className={styles.infoCard}>
            <span className={styles.icon}>📋</span>
            <h3 className={styles.cardTitle}>Notre Processus</h3>
            <ul className={styles.list}>
              <li>Visite d'un professionnel pour prendre les mesures</li>
              <li>Conseils personnalisés sur les portes et couleurs</li>
              <li>Devis établi sur place</li>
              <li>Livraison, démontage et pose inclus</li>
            </ul>
            <p className={styles.note}>* À partir de 3 étages, le prix de livraison augmente</p>
          </div>

          {/* Spécialités */}
          <div className={styles.infoCard}>
            <span className={styles.icon}>🚪</span>
            <h3 className={styles.cardTitle}>Nos Spécialités</h3>
            <ul className={styles.list}>
              <li>Portes de MAMAD (avec ou sans monture)</li>
              <li>Portes importées de Chine et d'Italie</li>
              <li>Contrôle qualité rigoureux</li>
            </ul>
          </div>

          {/* Serrures */}
          <div className={styles.infoCard}>
            <span className={styles.icon}>🔐</span>
            <h3 className={styles.cardTitle}>Types de Serrures</h3>
            <ul className={styles.list}>
              <li>Serrures à clés</li>
              <li>Serrures papillon</li>
              <li>Cylindres de sécurité</li>
              <li>Serrures magnétiques</li>
              <li>Œilleton pour WC ou salle de bain</li>
            </ul>
          </div>
        </div>

        <div className={styles.experience}>
          <p className={styles.experienceText}>
            <strong>18 ans</strong> d'expertise dans l'importation et la pose de portes de qualité supérieure
          </p>
        </div>
      </div>
    </section>
  );
}

export default CompanyInfo;
