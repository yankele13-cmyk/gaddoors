import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Standard Fonts do not need registration
// Font.register({ family: 'Rubik', ... });

const styles = StyleSheet.create({
  page: {
    padding: 30,
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 12,
    fontSize: 12,
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
    minHeight: 30
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    color: '#111'
  },
  colDesc: { width: '50%', padding: 5 },
  colQty: { width: '15%', padding: 5, textAlign: 'center' },
  colPrice: { width: '15%', padding: 5, textAlign: 'right' },
  colTotal: { width: '20%', padding: 5, textAlign: 'right' },
  
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

// Helper for RTL handling
const RTLView = ({ language, children, style }) => (
    <View style={[style, { flexDirection: language === 'he' ? 'row-reverse' : 'row' }]}>
        {children}
    </View>
);

export const InvoiceDocument = ({ data, language = 'fr', isWorkOrder = false }) => {
  const isRTL = language === 'he';
  const currency = data.currency || 'ILS';
  const symbol = currency === 'ILS' ? '₪' : (currency === 'EUR' ? '€' : '$');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
           <View style={styles.companyInfo}>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>GAD DOORS</Text>
              <Text>123 Rothschild Blvd</Text>
              <Text>Tel Aviv, Israel</Text>
              <Text>contact@gaddoors.com</Text>
           </View>
           <View>
              <Text style={styles.title}>
                  {isWorkOrder 
                    ? (language === 'he' ? 'הוראת עבודה' : 'FICHE DE TRAVAIL') 
                    : (language === 'he' ? 'הצעת מחיר' : 'DEVIS')
                  }
              </Text>
              <Text>#{data.id?.substring(0, 8).toUpperCase()}</Text>
              <Text>{new Date(data.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</Text>
           </View>
        </View>

        {/* Client Info */}
        <View style={styles.clientInfo}>
             <Text style={{ fontWeight: 'bold', textAlign: isRTL ? 'right' : 'left' }}>
                {language === 'he' ? 'לכבוד:' : 'Client:'}
             </Text>
             <Text style={{ textAlign: isRTL ? 'right' : 'left' }}>{data.clientName || 'Client'}</Text>
             <Text style={{ textAlign: isRTL ? 'right' : 'left' }}>{data.clientPhone || ''}</Text>
             {/* Add simplified address/code for work order */}
             {data.address && <Text style={{ textAlign: isRTL ? 'right' : 'left' }}>{data.address} - {data.city}</Text>}
        </View>

        {/* Table */}
        <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.colDesc, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {language === 'he' ? 'תיאור' : 'Description'}
                </Text>
                <Text style={styles.colQty}>
                    {language === 'he' ? 'כמות' : 'Qté'}
                </Text>
                {!isWorkOrder && (
                    <>
                        <Text style={[styles.colPrice, { textAlign: isRTL ? 'left' : 'right' }]}>
                            {language === 'he' ? 'מחיר יח\'' : 'P.U.'}
                        </Text>
                        <Text style={[styles.colTotal, { textAlign: isRTL ? 'left' : 'right' }]}>
                            {language === 'he' ? 'סה"כ' : 'Total'}
                        </Text>
                    </>
                )}
            </View>

            {/* Rows */}
            {data.items?.map((item, idx) => (
                <View key={idx} style={[styles.tableRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={styles.colDesc}>
                        <Text style={{ textAlign: isRTL ? 'right' : 'left', fontWeight: 'bold' }}>{item.name}</Text>
                        <Text style={{ textAlign: isRTL ? 'right' : 'left', fontSize: 10, color: '#666' }}>{item.description}</Text>
                    </View>
                    <Text style={styles.colQty}>{item.quantity}</Text>
                    {!isWorkOrder && (
                        <>
                            <Text style={[styles.colPrice, { textAlign: isRTL ? 'left' : 'right' }]}>{item.priceAtCreation} {symbol}</Text>
                            <Text style={[styles.colTotal, { textAlign: isRTL ? 'left' : 'right' }]}>{(item.priceAtCreation * item.quantity).toFixed(2)} {symbol}</Text>
                        </>
                    )}
                </View>
            ))}
        </View>

        {/* Totals - Only if NOT WorkOrder */}
        {!isWorkOrder && (
            <View style={[styles.totals, { alignItems: isRTL ? 'flex-start' : 'flex-end' }]}>
                <View style={[styles.totalRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text>{language === 'he' ? 'סה"כ לפני מע"מ:' : 'Sous-total HT:'}</Text>
                    <Text>{data.subtotal?.toFixed(2)} {symbol}</Text>
                </View>
                <View style={[styles.totalRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text>{language === 'he' ? 'מע"מ (17%):' : 'TVA (17%):'}</Text>
                    <Text>{data.tax?.toFixed(2)} {symbol}</Text>
                </View>
                <View style={[styles.totalRow, styles.grandTotal, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text>{language === 'he' ? 'סה"כ לתשלום:' : 'Total TTC:'}</Text>
                    <Text>{data.total?.toFixed(2)} {symbol}</Text>
                </View>
            </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
            <Text>{language === 'he' ? 'תודה שבחרתם גד דורס' : 'Merci de votre confiance - Gad Doors'}</Text>
            {isWorkOrder && <Text style={{ fontWeight: 'bold', marginTop: 5 }}>DOCUMENT INTERNE - NE PAS REMETTRE AU CLIENT</Text>}
        </View>

      </Page>
    </Document>
  );
};

export default InvoiceDocument;
