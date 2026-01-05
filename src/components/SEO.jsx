import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

export default function SEO({ title, description, canonical }) {
  const siteTitle = 'Gaddoors';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  
  // Default canonical to current URL if not provided (be careful with this in SPA, better to pass explicit)
  const currentUrl = window.location.href; 
  const linkCanonical = canonical || currentUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={linkCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={linkCanonical} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  canonical: PropTypes.string,
};
