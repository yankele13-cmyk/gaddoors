
import styles from './WhatsAppWidget.module.css';

function WhatsAppWidget() {
  const phoneNumber = "972552783693"; // Remplacez par votre numéro (format international sans +)
  const message = "Bonjour, je suis intéressé par vos produits."; // Message par défaut

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={styles.widget}
      aria-label="Contacter sur WhatsApp"
    >
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
        alt="WhatsApp" 
        className={styles.icon}
      />
    </a>
  );
}

export default WhatsAppWidget;
