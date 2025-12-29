
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById } from '../../services/db';
// Nous créerons ce fichier de style juste après
import styles from './ProductDetailPage.module.css';

export default function ProductDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams(); // Récupère l'ID depuis l'URL
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const productData = await getProductById(id);
        if (productData) {
          setProduct(productData);
        } else {
          setError("Produit non trouvé.");
        }
      } catch (err) {
        setError("Erreur lors du chargement du produit.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]); // Se redéclenche si l'ID dans l'URL change

  if (loading) {
    return <p>{t('product.loading')}</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{t('product.error')}</p>;
  }
  
  if (!product) {
    // Ce cas est techniquement couvert par l'erreur, mais c'est une bonne pratique
    return <p>{t('product.notFound')}</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className={styles.image} 
        />
      </div>
      <div className={styles.details}>
        <Link to="/catalogue" className={styles.backLink}>{t('product.back')}</Link>
        <span className={styles.category}>{product.category}</span>
        <h1 className={styles.title}>{product.name}</h1>
        <p className={styles.description}>{product.description || t('product.defaultDescription')}</p>
        
        <div className={styles.actions}>
           <button 
             onClick={() => navigate('/contact')}
             className={styles.quoteButton}
           >
             {t('product.quote')}
           </button>
        </div>

        <div className={styles.meta}>
          <p>{t('product.reference')} {product.id}</p>
        </div>
      </div>
    </div>
  );
}

