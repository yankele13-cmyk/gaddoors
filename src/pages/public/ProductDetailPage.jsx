import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../../services/db';
// Nous créerons ce fichier de style juste après
import styles from './ProductDetailPage.module.css';

function ProductDetailPage() {
  const { id } = useParams(); // Récupère l'ID depuis l'URL
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
    return <p>Chargement du produit...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }
  
  if (!product) {
    // Ce cas est techniquement couvert par l'erreur, mais c'est une bonne pratique
    return <p>Produit non trouvé.</p>;
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
        <Link to="/catalogue" className={styles.backLink}>← Retour au catalogue</Link>
        <span className={styles.category}>{product.category}</span>
        <h1 className={styles.title}>{product.name}</h1>
        <p className={styles.description}>{product.description || "Une porte d'exception alliant sécurité maximale et design contemporain. Finitions personnalisables sur demande."}</p>
        
        <div className={styles.actions}>
           <button className={styles.quoteButton}>Demander un Devis</button>
        </div>

        <div className={styles.meta}>
          <p>Référence Modèle : {product.id}</p>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;

