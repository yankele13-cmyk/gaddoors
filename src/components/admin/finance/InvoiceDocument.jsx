import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20, // Reduced padding
    fontSize: 12,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
  },
  companyDetails: {
    textAlign: 'right',
    fontSize: 10,
    color: '#555555',
    width: '40%', // Constrain width
  },
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
    width: '100%', // Explicit full width
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#e5e7eb',
    marginTop: 20,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
    width: '100%', // Explicit full width
  },
  // Columns - sums to 100%
  colDescription: { width: '45%', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb', padding: 5 },
  colQty: { width: '15%', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb', padding: 5, textAlign: 'center' },
  colPrice: { width: '20%', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb', padding: 5, textAlign: 'right' },
  colTotal: { width: '20%', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb', padding: 5, textAlign: 'right' },
  
  // Header variants
  headerBg: { backgroundColor: '#f9fafb', fontWeight: 'bold' },

  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
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
  }
});

const InvoiceDocument = ({ data }) => {
  const { invoiceNumber, date, client, sender, items, taxRate } = data;

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
             <Text style={styles.logo}>{sender.name}</Text>
             <Text style={{ fontSize: 10, marginTop: 5 }}>{sender.subline}</Text>
          </View>
          <View style={styles.companyDetails}>
            <Text>{sender.address}</Text>
            <Text>{sender.city}</Text>
            <Text>{sender.phone}</Text>
            <Text>{sender.email}</Text>
          </View>
        </View>

        {/* Invoice Info */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
           <View style={styles.billTo}>
            <Text style={styles.billToTitle}>Facturé à :</Text>
            <Text>{client.name}</Text>
            <Text>{client.address}</Text>
            <Text>{client.email}</Text>
          </View>
          <View style={{ marginTop: 20 }}>
             <Text>Facture N° : <Text style={{ fontWeight: 'bold' }}>{invoiceNumber}</Text></Text>
             <Text>Date : {date}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.colDescription, styles.headerBg]}><Text>Description</Text></View>
            <View style={[styles.colQty, styles.headerBg]}><Text>Qté</Text></View>
            <View style={[styles.colPrice, styles.headerBg]}><Text>Prix Unit.</Text></View>
            <View style={[styles.colTotal, styles.headerBg]}><Text>Total</Text></View>
          </View>
          {items.map((item, index) => (
             <View style={styles.tableRow} key={index}>
              <View style={styles.colDescription}><Text>{item.description}</Text></View>
              <View style={styles.colQty}><Text>{item.quantity}</Text></View>
              <View style={styles.colPrice}><Text>{parseFloat(item.price).toFixed(2)} €</Text></View>
              <View style={styles.colTotal}><Text>{(item.quantity * item.price).toFixed(2)} €</Text></View>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
             <Text>Sous-total :</Text>
             <Text>{subtotal.toFixed(2)} €</Text>
          </View>
          <View style={styles.totalRow}>
             <Text>TVA ({taxRate}%) :</Text>
             <Text>{tax.toFixed(2)} €</Text>
          </View>
          <View style={styles.grandTotal}>
             <Text>TOTAL TTC :</Text>
             <Text>{total.toFixed(2)} €</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Merci de votre confiance. Conditions de paiement : 30 jours.</Text>
          <Text>{sender.footer}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceDocument;
