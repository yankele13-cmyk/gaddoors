import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Si pas d'ancre (hash), on remonte tout en haut
    if (!hash) {
      try {
        // 1. Standard Window Scroll
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        
        // 2. Fallback for potential container scrolls (Fix for global wrappers)
        const root = document.getElementById('root');
        if (root) root.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } catch (e) {
        // Fallback for older browsers
        window.scrollTo(0, 0);
      }
    }
  }, [pathname, hash]);

  return null;
}
