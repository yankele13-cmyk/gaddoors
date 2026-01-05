import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { getProductById } from '../../services/db';
// Nous créerons ce fichier de style juste après
import styles from './ProductDetailPage.module.css';

export default function ProductDetailPage() {
  const { t, i18n } = useTranslation();
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
  }, [id, i18n.language]); // Se redéclenche si l'ID ou la langue change

  if (loading) {
    return (
        <>
            <SEO title={t('product.loading', 'Chargement...')} />
            <p>{t('product.loading')}</p>
        </>
    );
  }

  if (error) {
    return (
        <>
            <SEO title={t('product.error', 'Erreur')} />
            <p style={{ color: 'red' }}>{t('product.error')}</p>
        </>
    );
  }
  
  if (!product) {
    // Ce cas est techniquement couvert par l'erreur, mais c'est une bonne pratique
    return (
        <>
            <SEO title={t('product.notFound', 'Produit non trouvé')} />
            <p>{t('product.notFound')}</p>
        </>
    );
  }

  
  const displayCategory = product.category ? t(`categories.${product.category}`, product.category) : '';
  const metaDescription = product.description 
    ? product.description.substring(0, 150) + (product.description.length > 150 ? '...' : '') 
    : t('product.defaultDescription');

  return (
    <div className={styles.container}>
      <SEO 
        title={product.name} 
        description={metaDescription}
      />
      <div className={styles.imageContainer}>
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className={styles.image} 
        />
      </div>
      <div className={styles.details}>
        <Link to="/catalogue" className={styles.backLink}>{t('product.back')}</Link>
        <span className={styles.category}>{displayCategory}</span>
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

        {/* SEO Static Info */}
        <div className="mt-8 pt-8 border-t border-zinc-800">
             <h2 className="text-xl font-bold text-white mb-4">{t('product.technical.title')}</h2>
             <ul className="text-gray-400 space-y-2 mb-6">
                {(t('product.technical.features', { returnObjects: true }) || []).map((feature, idx) => (
                    <li key={idx}>• {feature}</li>
                ))}
             </ul>
             
             <h2 className="text-xl font-bold text-white mb-4">{t('product.warranty.title')}</h2>
             <p className="text-gray-400 mb-6">{t('product.warranty.text')}</p>

             <div className="flex gap-4 text-sm mt-4">
                 <a href="/catalogue" className="text-[#d4af37] border-b border-[#d4af37] hover:text-white pb-1">Voir d'autres modèles</a>
             </div>
        </div>

      </div>
    </div>
  );

}
