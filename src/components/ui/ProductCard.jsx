// src/components/ui/ProductCard.jsx
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';

function ProductCard({ product }) {
  if (!product) {
    return <div className={styles.card}>Chargement...</div>;
  }

  // Use the imageUrl directly from Firestore (which points to /images/...)
  // Or a placeholder if missing
  const imageUrl = product.imageUrl || 'https://via.placeholder.com/300';
  
  return (
    <Link to={`/produit/${product.id}`} className={styles.link}>
      <div className={styles.card}>
          <div className={styles.imageContainer}>
            <img 
              src={imageUrl} 
              alt={product.name} 
              className={styles.image} 
              loading="lazy"
            />
          </div>
        <div className={styles.content}>
          <h3 className={styles.title}>{product.name}</h3>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
