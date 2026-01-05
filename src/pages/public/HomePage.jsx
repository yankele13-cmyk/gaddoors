import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Added
import SEO from '../../components/SEO';
import styles from './HomePage.module.css';
import InstallationsSlider from '../../modules/marketing/components/InstallationsSlider';
import CompanyInfo from '../../modules/marketing/components/CompanyInfo';

function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <SEO 
        title={t('home.seo.title', 'Portes Intérieures Design | Gad Doors')} 
        description={t('home.seo.description', 'Découvrez Gaddoors, votre expert en portes intérieures design et sur mesure. Qualité, esthétique et innovation pour votre intérieur.')} 
      />
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>{t('home.hero.title')}</h1>
          <p className={styles.subtitle}>{t('home.hero.subtitle')}</p>
          <Link to="/catalogue" className={styles.ctaButton}>{t('home.hero.cta')}</Link>
        </div>
      </section>

      <section className="py-16 px-4 max-w-7xl mx-auto text-white">
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
                 <h2 className="text-3xl font-heading text-[#d4af37] mb-6">{t('home.seo_section.expertise_title')}</h2>
                 <p className="text-gray-300 leading-relaxed text-lg mb-6">{t('home.seo_section.expertise_text')}</p>
                 <a href="/contact" className="text-[#d4af37] underline hover:text-white transition">
                    Contactez-nous pour un devis gratuit
                 </a>
            </div>
            <div>
                 <h2 className="text-3xl font-heading text-[#d4af37] mb-6">{t('home.seo_section.services_title')}</h2>
                 <p className="text-gray-300 leading-relaxed text-lg mb-6">{t('home.seo_section.services_text')}</p>
                   <ul className="text-gray-400 space-y-2 mb-6">
                       <li>✓ Installation de portes sur mesure</li>
                       <li>✓ Pose de portes d'intérieur design</li>
                       <li>✓ Rénovation de menuiserie intérieure</li>
                       <li>✓ Conseils en décoration et acoustique</li>
                   </ul>
                 <a href="/realisations" className="text-[#d4af37] underline hover:text-white transition">
                    Voir nos dernières réalisations
                 </a>
            </div>
        </div>
      </section>

      <InstallationsSlider />
      
      <CompanyInfo />
      
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl font-heading text-[#d4af37] mb-12 text-center">{t('home.faq.title')}</h2>
        <div className="space-y-8">
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
                <h3 className="text-xl font-bold text-white mb-3">{t('home.faq.q1')}</h3>
                <p className="text-gray-400 leading-relaxed">{t('home.faq.a1')}</p>
            </div>
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
                <h3 className="text-xl font-bold text-white mb-3">{t('home.faq.q2')}</h3>
                <p className="text-gray-400 leading-relaxed">{t('home.faq.a2')}</p>
            </div>
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
                <h3 className="text-xl font-bold text-white mb-3">{t('home.faq.q3')}</h3>
                <p className="text-gray-400 leading-relaxed">{t('home.faq.a3')}</p>
            </div>
        </div>
      </section>

      {/* Internal Links Sections (SEO Footer) */}
      <section className="bg-zinc-900 py-12 px-4 border-t border-zinc-800">
          <div className="max-w-7xl mx-auto">
              <h2 className="text-xl font-bold text-white mb-4">Navigation Rapide</h2>
              <div className="flex flex-wrap gap-4 text-gray-400">
                  <a href="/catalogue" className="hover:text-[#d4af37] transition">Portes Intérieures</a> | 
                  <a href="/catalogue" className="hover:text-[#d4af37] transition">Poignées Design</a> | 
                  <a href="/realisations" className="hover:text-[#d4af37] transition">Galerie Photos</a> | 
                  <a href="/contact" className="hover:text-[#d4af37] transition">Devis Gratuit</a>
              </div>
          </div>
      </section>
    </>
  );
}

export default HomePage;


