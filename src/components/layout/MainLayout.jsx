// src/components/layout/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import styles from './MainLayout.module.css';
import WhatsAppWidget from '../ui/WhatsAppWidget';

function MainLayout() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppWidget />
    </div>
  );
}

export default MainLayout;
