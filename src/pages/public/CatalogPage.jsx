import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../../components/SEO';
import { getProducts } from '../../services/db';
import ProductCard from '../../components/ui/ProductCard';
import styles from './CatalogPage.module.css';

function CatalogPage() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'doors', 'handles'

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const productList = await getProducts();
        setProducts(productList);
        setError(null);
      } catch (err) {
        setError(t('catalog.error'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [t, i18n.language]);

  const filteredProducts = products.filter(product => {
    // Helper to check for handle keywords in name or originalName
    const checkHandle = (str) => str && (
      str.toLowerCase().includes('handle') || 
      str.toLowerCase().includes('poignée') ||
      str.toLowerCase().includes('poigné') ||
      str.toLowerCase().includes('modello') ||
      str.toLowerCase().includes('maniglia') // Fix: Allow renormalized handles to show
    );

    // Filter to only show doors and handles (no other accessories)
    const isHandle = checkHandle(product.name) || 
                     checkHandle(product.originalName) || 
                     product.category === 'Poignées';

    const isDoor = product.category === 'Portes Intérieures' || 
                   product.category === 'Portes' || // Fix: Match DB category
                   product.name.toLowerCase().includes('porte') ||
                   product.name.toLowerCase().includes('door') ||
                   (product.originalName && (product.originalName.toLowerCase().includes('porte') || product.originalName.toLowerCase().includes('door')));
    
    // First filter: only doors and handles allowed
    if (!isDoor && !isHandle) return false;
    
    // We do NOT strictly filter by 'doors' or 'handles' anymore, 
    // because the user requested "Handles first, THEN doors" for the Poignées view.
    // So all valid items (Door/Handle) are shown, just sorted differently.
    return true;
  }).sort((a, b) => {
    // Helper to check for handle keywords
    const isHandle = (p) => {
      const str = (p.name + " " + (p.originalName || "")).toLowerCase();
      return p.category === 'Poignées' || 
             str.includes('modello') || 
             str.includes('maniglia') || 
             str.includes('handle') || 
             str.includes('poignée');
    };

    const isDoor = (p) => {
       const str = (p.name + " " + (p.originalName || "")).toLowerCase();
       return p.category === 'Portes Intérieures' || 
              p.category === 'Portes' || // Fix: Match DB category
              str.includes('porte') || 
              str.includes('door');
    };

    const aIsHandle = isHandle(a);
    const bIsHandle = isHandle(b);
    const aIsDoor = isDoor(a);
    const bIsDoor = isDoor(b);

    // Explicit Priority: depends on Filter
    if (filter === 'handles') {
        // Handles First
        if (aIsHandle && !bIsHandle) return -1;
        if (!aIsHandle && bIsHandle) return 1;
        // If items are mixed or same type, fallback to name
        if (aIsDoor && !bIsDoor) return 1; // Doors after
        if (!aIsDoor && bIsDoor) return -1;
    } else {
        // Default / All / Doors selected: Doors First
        if (aIsDoor && !bIsDoor) return -1;
        if (!aIsDoor && bIsDoor) return 1;
        // Handles after
        if (aIsHandle && !bIsHandle) return 1;
        if (!aIsHandle && bIsHandle) return -1;
    }

    return a.name.localeCompare(b.name);
  });

  if (loading) {
    return (
      <div className={styles.container}>
        <SEO title={t('catalog.title', 'Catalogue')} />
        <div style={{color: 'white', textAlign: 'center', marginTop: '100px', fontSize: '1.5rem'}}>
           {t('catalog.loading')}
        </div>
      </div>
    );
  }

  if (error) {
    return (
        <div className={styles.container}>
            <SEO title={t('catalog.title', 'Catalogue')} />
            <p style={{ color: '#ef4444', textAlign: 'center' }}>{t('catalog.error')}</p>
        </div>
    );
  }

  return (
    <div className={styles.container}>
      <SEO 
        title={t('catalog.seo.title', 'Notre Catalogue')} 
        description={t('catalog.seo.description', 'Parcourez notre collection de portes intérieures et poignées design.')}
      />
      <h1 className={styles.title}>{t('catalog.title')}</h1>
      
      {/* Introduction SEO */}
      <section className="max-w-4xl mx-auto text-center mb-12 px-4">
        <h2 className="text-2xl font-semibold text-[#d4af37] mb-4">{t('catalog.seo_intro.title')}</h2>
        <p className="text-gray-300 leading-relaxed">{t('catalog.seo_intro.text')}</p>
      </section>

      <div className={styles.filters}>
        <button 
          onClick={() => setFilter('all')} 
          className={`${styles.filterBtn} ${filter === 'all' ? styles.activeFilter : ''}`}
        >
          {t('catalog.filters.all')}
        </button>
        <button 
          onClick={() => setFilter('doors')} 
          className={`${styles.filterBtn} ${filter === 'doors' ? styles.activeFilter : ''}`}
        >
          {t('catalog.filters.doors')}
        </button>
        <button 
          onClick={() => setFilter('handles')} 
          className={`${styles.filterBtn} ${filter === 'handles' ? styles.activeFilter : ''}`}
        >
          {t('catalog.filters.handles')}
        </button>
      </div>

      <div className={styles.grid}>
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Outro SEO */}
      <section className="max-w-4xl mx-auto mt-16 px-4 bg-zinc-900/50 p-8 rounded-2xl">
        <h2 className="text-2xl font-semibold text-white mb-4">{t('catalog.seo_outro.title')}</h2>
        <p className="text-gray-400 mb-6">{t('catalog.seo_outro.text')}</p>
        <div className="flex gap-4">
            <a href="/contact" className="text-[#d4af37] underline hover:text-white">{t('catalog.filters.ask_advice')}</a>
            <a href="/realisations" className="text-[#d4af37] underline hover:text-white">{t('catalog.filters.see_projects')}</a>
        </div>
      </section>

    </div>
  );
}

export default CatalogPage;
