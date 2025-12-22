import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Si pas d'ancre (hash), on remonte tout en haut
    if (!hash) {
      window.scrollTo(0, 0);
    }
    // Si ancre présente, on laisse le comportement natif du navigateur gérer le scroll
    // (ou on pourrait implementer un scrollIntoView ici si nécessaire)
  }, [pathname, hash]);

  return null;
}
