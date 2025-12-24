import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Standard Fonts do not need registration
// Font.register({ family: 'Rubik', ... });

// 2. I18N DICTIONARY
const DICTIONARY = {
  fr: {
    billedTo: "Facturé à :",
    invoiceNo: "Facture N°",
    date: "Date",
    description: "Description",
    qty: "Qté",
    unitPrice: "Prix Unit.",
    total: "Total",
    subtotal: "Sous-total",
    vat: "TVA",
    totalTTC: "TOTAL TTC",
    footer: "Merci de votre confiance. Conditions de paiement : 30 jours."
  },
  he: {
    billedTo: "לכב':",
    invoiceNo: "חשבונית מס קבלה",
    date: "תאריך",
    description: "תיאור",
    qty: "כמות",
    unitPrice: "מחיר יח'",
    total: 'סה"כ',
    subtotal: "סיכום ביניים",
    vat: "מע\"מ",
    totalTTC: 'סה"כ לתשלום',
    footer: "תודה שבחרתם בנו. תנאי תשלום: שוטף + 30."
  }
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 12,
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#d4af37',
    paddingBottom: 10,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
  },
  companyDetails: {
    fontSize: 10,
    color: '#555555',
    width: '40%',
  },
  // Dynamic layouts will be handled via inline styles for RTL
  billTo: {
    marginTop: 20,
    marginBottom: 20,
    width: '40%',
  },
  billToTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
    color: '#d4af37',
  },
  table: {
    display: 'table',
    width: '100%',
    borderColor: '#e5e7eb',
    borderBottomWidth: 1,
    marginTop: 20,
  },
  tableRow: {
    flexDirection: 'row', // Will be reversed for RTL
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
    minHeight: 24,
  },
  headerBg: { 
    backgroundColor: '#f9fafb', 
    fontWeight: 'bold', 
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  
  // Columns
  colDescription: { width: '45%', padding: 5, textAlign: 'left' },
  colQty: { width: '15%', padding: 5, textAlign: 'center' },
  colPrice: { width: '20%', padding: 5, textAlign: 'right' },
  colTotal: { width: '20%', padding: 5, textAlign: 'right' },

  totals: {
    marginTop: 20,
    width: '100%',
    alignItems: 'flex-end', // Left for RTL? handled dynamically
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    paddingVertical: 5,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#d4af37',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 10,
    color: '#999999',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  }
});

const InvoiceDocument = ({ data, language = 'fr' }) => {
  const { invoiceNumber, date, client, sender, items, taxRate } = data;
  const isRTL = language === 'he';
  const t = DICTIONARY[language] || DICTIONARY.fr;
  const currency = isRTL ? '₪' : '€';

  // RTL Helpers
  const directionStyle = isRTL ? { flexDirection: 'row-reverse' } : { flexDirection: 'row' };
  const textAlignStart = isRTL ? { textAlign: 'right' } : { textAlign: 'left' };
  const textAlignEnd = isRTL ? { textAlign: 'left' } : { textAlign: 'right' };
  
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={[styles.header, directionStyle]}>
          <View>
             <Text style={styles.logo}>{sender.name}</Text>
             <Text style={{ fontSize: 10, marginTop: 5, ...textAlignStart }}>{sender.subline}</Text>
          </View>
          <View style={[styles.companyDetails, textAlignEnd]}>
            <Text>{sender.address}</Text>
            <Text>{sender.city}</Text>
            <Text>{sender.phone}</Text>
            <Text>{sender.email}</Text>
          </View>
        </View>

        {/* Invoice Info */}
        <View style={[{ justifyContent: 'space-between' }, directionStyle]}>
           <View style={[styles.billTo, textAlignStart]}>
            <Text style={[styles.billToTitle, textAlignStart]}>{t.billedTo}</Text>
            <Text>{client.name}</Text>
            <Text>{client.address}</Text>
            <Text>{client.email}</Text>
          </View>
          <View style={{ marginTop: 20, ...textAlignEnd }}>
             <Text>{t.invoiceNo} : <Text style={{ fontWeight: 'bold' }}>{invoiceNumber}</Text></Text>
             <Text>{t.date} : {date}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.headerBg, directionStyle]}>
            <View style={[styles.colDescription, textAlignStart]}><Text>{t.description}</Text></View>
            <View style={styles.colQty}><Text>{t.qty}</Text></View>
            <View style={[styles.colPrice, textAlignEnd]}><Text>{t.unitPrice}</Text></View>
            <View style={[styles.colTotal, textAlignEnd]}><Text>{t.total}</Text></View>
          </View>
          {items.map((item, index) => (
             <View style={[styles.tableRow, directionStyle]} key={index}>
              <View style={[styles.colDescription, textAlignStart]}><Text>{item.description}</Text></View>
              <View style={styles.colQty}><Text>{item.quantity}</Text></View>
              <View style={[styles.colPrice, textAlignEnd]}><Text>{parseFloat(item.price).toFixed(2)} {currency}</Text></View>
              <View style={[styles.colTotal, textAlignEnd]}><Text>{(item.quantity * item.price).toFixed(2)} {currency}</Text></View>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={[styles.totals, { alignItems: isRTL ? 'flex-start' : 'flex-end' }]}>
          <View style={[styles.totalRow, directionStyle]}>
             <Text>{t.subtotal} :</Text>
             <Text>{subtotal.toFixed(2)} {currency}</Text>
          </View>
          <View style={[styles.totalRow, directionStyle]}>
             <Text>{t.vat} ({taxRate}%) :</Text>
             <Text>{tax.toFixed(2)} {currency}</Text>
          </View>
          <View style={[styles.grandTotal, directionStyle]}>
             <Text>{t.totalTTC} :</Text>
             <Text>{total.toFixed(2)} {currency}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{t.footer}</Text>
          <Text>{sender.footer}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceDocument;
