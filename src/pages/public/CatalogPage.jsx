import { useState, useEffect } from 'react';
import { getProducts } from '../../services/db';
import ProductCard from '../../components/ui/ProductCard';
import styles from './CatalogPage.module.css';

function CatalogPage() {
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
        setError("Impossible de charger les produits.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    // Helper to check for handle keywords in name or originalName
    const checkHandle = (str) => str && (
      str.toLowerCase().includes('handle') || 
      str.toLowerCase().includes('poignée') ||
      str.toLowerCase().includes('poigné') ||
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
                   product.name.toLowerCase().includes('porte') ||
                   product.name.toLowerCase().includes('door') ||
                   (product.originalName && (product.originalName.toLowerCase().includes('porte') || product.originalName.toLowerCase().includes('door')));
    
    // First filter: only doors and handles allowed
    if (!isDoor && !isHandle) return false;
    
    // Then apply user's filter selection
    if (filter === 'all') return true;
    if (filter === 'doors') return isDoor;
    if (filter === 'handles') return isHandle;
    return false;
  }).sort((a, b) => {
    // Helper for sorting
    const isHandleA = a.name.includes('Modello') || (a.originalName && a.originalName.toLowerCase().includes('handle'));
    const isHandleB = b.name.includes('Modello') || (b.originalName && b.originalName.toLowerCase().includes('handle'));
    
    if (!isHandleA && isHandleB) return -1;
    if (isHandleA && !isHandleB) return 1;
    return a.name.localeCompare(b.name);
  });

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{color: 'white', textAlign: 'center', marginTop: '100px', fontSize: '1.5rem'}}>
           Chargement de la collection...
        </div>
      </div>
    );
  }

  if (error) {
    return (
        <div className={styles.container}>
            <p style={{ color: '#ef4444', textAlign: 'center' }}>{error}</p>
        </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Notre Collection</h1>
      
      <div className={styles.filters}>
        <button 
          onClick={() => setFilter('all')} 
          className={`${styles.filterBtn} ${filter === 'all' ? styles.activeFilter : ''}`}
        >
          Tout Voir
        </button>
        <button 
          onClick={() => setFilter('doors')} 
          className={`${styles.filterBtn} ${filter === 'doors' ? styles.activeFilter : ''}`}
        >
          Portes
        </button>
        <button 
          onClick={() => setFilter('handles')} 
          className={`${styles.filterBtn} ${filter === 'handles' ? styles.activeFilter : ''}`}
        >
          Poignées Design
        </button>
      </div>

      <div className={styles.grid}>
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default CatalogPage;
