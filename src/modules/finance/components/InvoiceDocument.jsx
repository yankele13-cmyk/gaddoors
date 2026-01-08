import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image, Link } from '@react-pdf/renderer';

// --- CONFIGURATION D'ÉCRITURE REMPLAÇABLE ---
// Modifiez les textes ici pour changer ce qui est écrit sur les PDF
const DICTIONARY = {
  fr: {
    // En-têtes
    quoteTitle: "DEVIS",
    invoiceTitle: "FACTURE",
    quoteInvoiceTitle: "FACTURE", // Fallback changed to Facture as requested
    workOrderTitle: "FICHE DE TRAVAIL",
    
    // Labels Client
    clientLabel: "Client :",
    
    // Colonnes Tableau
    colDescription: "Description",
    colQty: "Qté",
    colUnitPrice: "P.U.",
    colTotal: "Total",
    
    // Totaux
    subTotalLabel: "Sous-total HT :",
    vatLabel: "TVA (17%) :",
    totalLabel: "Total TTC :",
    
    // Pied de page
    footerText: "Merci de votre confiance - Gad Doors",
    internalDocWarning: "DOCUMENT INTERNE - NE PAS REMETTRE AU CLIENT (KABLAN)",
    companyAddress: "Aaron Eshkoli 115, Jerusalem"
  },
  he: {
    // En-têtes
    // En-têtes
    quoteTitle: "הצעת מחיר",
    invoiceTitle: "חשבונית",
    quoteInvoiceTitle: "הצעת מחיר / חשבונית",
    workOrderTitle: "הוראת עבודה",
    
    // Labels Client
    clientLabel: "לכבוד:",
    
    // Colonnes Tableau
    colDescription: "תיאור",
    colQty: "כמות",
    colUnitPrice: "מחיר ליחידה",
    colTotal: 'סה"כ',
    
    // Totaux
    subTotalLabel: 'סה"כ לפני מע"מ:',
    vatLabel: 'מע"מ (17%):',
    totalLabel: 'סה"כ לתשלום:',
    
    // Pied de page
    footerText: "תודה שבחרתם גד דורס",
    internalDocWarning: "מסמך פנימי - לא למסירה ללקוח (קבלן)",
    companyAddress: "אהרון אשכולי 115, ירושלים"
  },
  en: {
    // Headers
    quoteTitle: "QUOTE",
    invoiceTitle: "INVOICE",
    quoteInvoiceTitle: "QUOTE / INVOICE",
    workOrderTitle: "WORK ORDER",
    
    // Customer Labels
    clientLabel: "To:",
    
    // Table Columns
    colDescription: "Description",
    colQty: "Qty",
    colUnitPrice: "Unit Price",
    colTotal: "Total",
    
    // Totals
    subTotalLabel: "Subtotal:",
    vatLabel: "VAT (17%):",
    totalLabel: "Total Due:",
    
    // Footer
    footerText: "Thank you for your business - Gad Doors",
    internalDocWarning: "INTERNAL DOC - DO NOT DELIVER TO CLIENT (WORK ORDER)",
    companyAddress: "Aaron Eshkoli 115, Jerusalem"
  }
};

// Register a font that supports Hebrew (Rubik)
const fontUrl = (path) => `${window.location.origin}${path}`;

Font.register({
  family: 'Rubik',
  fonts: [
    { src: '/fonts/Rubik-Regular.ttf' },
    { src: '/fonts/Rubik-Bold.ttf', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Rubik', // Use Hebrew-compatible font
    fontSize: 10,
    color: '#333'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottom: '1px solid #d4af37',
    paddingBottom: 20
  },
  logo: {
    width: 60,
    height: 60,
  },
  companyInfo: {
    textAlign: 'left'
  },
  title: {
    fontSize: 24,
    color: '#d4af37',
    marginBottom: 10,
    fontWeight: 'bold'
  },
  clientInfo: {
    marginBottom: 30,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 5
  },
  table: {
    display: "table",
    width: "auto",
    marginBottom: 30
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    minHeight: 40 // Increased height for images
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    color: '#111'
  },
  colImg: { width: '10%', padding: 5 },
  colDesc: { width: '35%', padding: 5 },
  colQty: { width: '10%', padding: 5, textAlign: 'center' },
  colPrice: { width: '20%', padding: 5, textAlign: 'right' },
  colTotal: { width: '25%', padding: 5, textAlign: 'right' },
  
  totals: {
    marginTop: 20,
    alignItems: 'flex-end'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    paddingVertical: 5
  },
  grandTotal: {
    borderTop: '2px solid #d4af37',
    paddingTop: 5,
    marginTop: 5,
    fontWeight: 'bold',
    fontSize: 14
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#999',
    borderTop: '1px solid #eee',
    paddingTop: 10
  }
});

export const InvoiceDocument = ({ data, language = 'fr', docType = 'invoice', isWorkOrder = false, customTexts = {} }) => {
  // Determine RTL based on language OR data context (force Hebrew for now if mostly Hebrew users)
  // But let's respect the prop
  const isRTL = language === 'he';
  const currency = data.currency || 'ILS';
  // Use simple text for currency to avoid font glyph issues if symbol missing in font (Rubik usually has it)
  const symbol = currency === 'ILS' ? '₪' : (currency === 'EUR' ? '€' : '$'); 

  // Get texts based on language and MERGE with customTexts
  // If customTexts contains everything (fetched from DB), it will override defaults
  const defaultTexts = DICTIONARY[language] || DICTIONARY.fr; 
  const texts = { ...defaultTexts, ...customTexts };

  // Format Helpers
  const formatPrice = (price) => {
      const num = Number(price) || 0;
      return num.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
           <View>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>GAD DOORS</Text>
              <Link src="https://www.google.com/maps/search/?api=1&query=Aaron+Eshkoli+115+Jerusalem" style={{ textDecoration: 'none', color: '#333' }}>
                  <Text>{texts.companyAddress}</Text>
              </Link>
              <Text>Tel: +972 55 278 3693</Text>
              <Text>contact@gaddoors.com</Text>
           </View>
           <View>
              <Text style={styles.title}>
                  {docType === 'workOrder' || isWorkOrder ? texts.workOrderTitle : (docType === 'quote' ? texts.quoteTitle : texts.invoiceTitle)}
              </Text>

              <Text>#{String(data.humanId || data.invoiceNumber || data.id?.substring(0, 8) || '').toUpperCase()}</Text>
              <Text>{String(data.date || new Date(Number(data.createdAt?.seconds || 0) * 1000 || Date.now()).toLocaleDateString())}</Text>
           </View>
        </View>

        {/* Client Info */}
        <View style={styles.clientInfo}>
             <Text style={{ fontWeight: 'bold', textAlign: isRTL ? 'right' : 'left' }}>
                {texts.clientLabel}
             </Text>
             <Text style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {String(data.clientSnapshot?.name || data.client?.name || data.clientName || 'Client')}
             </Text>
             <Text style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {String(data.clientSnapshot?.phone || data.client?.phone || data.clientPhone || '')}
             </Text>
             <Text style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {String(data.clientSnapshot?.address || data.client?.address || data.address || '')}
                {data.city ? ` - ${String(data.city)}` : ''}
             </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={styles.colImg}> </Text>
                <Text style={[styles.colDesc, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {texts.colDescription}
                </Text>
                <Text style={styles.colQty}>
                    {texts.colQty}
                </Text>
                {!isWorkOrder && (
                    <>
                        <Text style={[styles.colPrice, { textAlign: isRTL ? 'left' : 'right' }]}>
                            {texts.colUnitPrice}
                        </Text>
                        <Text style={[styles.colTotal, { textAlign: isRTL ? 'left' : 'right' }]}>
                            {texts.colTotal}
                        </Text>
                    </>
                )}
            </View>

            {/* Rows */}
            {data.items?.map((item, idx) => {
                const unitPrice = Number(item.priceSnapshot || item.priceAtCreation || item.price || 0);
                const rowTotal = unitPrice * (Number(item.quantity) || 1);

                return (
                <View key={idx} style={[styles.tableRow, { flexDirection: isRTL ? 'row-reverse' : 'row', backgroundColor: idx % 2 === 0 ? '#fafafa' : '#fff' }]}>
                    <View style={styles.colImg}>
                        {/* 
                           IMAGE DISABLED TEMPORARILY TO PREVENT CRASH 
                           Due to missing CORS configuration on Firebase Storage.
                           Uncomment this block after running gsutil cors set.
                        
                        {item.image ? (
                            <Image src={String(item.image)} style={{ width: 30, height: 30 }} />
                        ) : null}
                        */}
                    </View>
                    <View style={styles.colDesc}>
                        <Text style={{ textAlign: isRTL ? 'right' : 'left', fontWeight: 'bold' }}>{String(item.name || item.description || '')}</Text>
                        {item.specs && (
                             <Text style={{ textAlign: isRTL ? 'right' : 'left', fontSize: 8, color: '#666' }}>
                                {String(item.specs.width || '?')}cm - {String(item.specs.opening || '')}
                             </Text>
                        )}
                    </View>
                    <Text style={styles.colQty}>{String(item.quantity)}</Text>
                    {!isWorkOrder && (
                        <>
                            <Text style={[styles.colPrice, { textAlign: isRTL ? 'left' : 'right' }]}>
                                {String(formatPrice(unitPrice))} {String(symbol)}
                            </Text>
                            <Text style={[styles.colTotal, { textAlign: isRTL ? 'left' : 'right', fontWeight: 'bold' }]}>
                                {String(formatPrice(rowTotal))} {String(symbol)}
                            </Text>
                        </>
                    )}
                </View>
                );
            })}
        </View>

        {/* Totals - Only if NOT WorkOrder */}
        {!isWorkOrder && (
            <View style={[styles.totals, { alignItems: isRTL ? 'flex-start' : 'flex-end' }]}>
                <View style={[styles.totalRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text>{String(texts.subTotalLabel)}</Text>
                    <Text>{String(formatPrice(data.totals?.totalHT || data.financials?.subTotal || data.subtotal))} {String(symbol)}</Text>
                </View>
                <View style={[styles.totalRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text>{String(texts.vatLabel)}</Text>
                    <Text>{String(formatPrice(data.totals?.maam || data.financials?.vatAmount || data.tax))} {String(symbol)}</Text>
                </View>
                <View style={[styles.totalRow, styles.grandTotal, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text>{String(texts.totalLabel)}</Text>
                    <Text>{String(formatPrice(data.totals?.totalTTC || data.financials?.totalGt || data.total))} {String(symbol)}</Text>
                </View>
            </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
            <Text>{texts.footerText}</Text>
            {isWorkOrder && <Text style={{ fontWeight: 'bold', marginTop: 5 }}>{texts.internalDocWarning}</Text>}
        </View>

      </Page>
    </Document>
  );
};

export default InvoiceDocument;
