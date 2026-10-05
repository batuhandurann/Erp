/**
 * UBL-TR 2.1 E-Fatura / E-Arşiv XML Generator
 * Compatible with Revenue Administration of Turkey (GİB) standard schemas.
 */

import { Sale, Proforma } from '../types';

export function generateUblInvoiceXml(doc: Sale | Proforma, companySettings: any): string {
  const isSale = 'invoiceNumber' in doc;
  const invoiceNumber = isSale ? (doc as Sale).invoiceNumber : (doc as Proforma).proformaNumber;
  const issueDate = new Date((doc as any).date || Date.now()).toISOString().slice(0, 10);
  const issueTime = new Date((doc as any).date || Date.now()).toISOString().slice(11, 19);
  const currency = doc.currency || 'TRY';

  const supplierName = companySettings?.name || 'Apex Teknoloji Çözümleri A.Ş.';
  const supplierTaxNo = companySettings?.taxNumber || '1234567890';
  const supplierTaxOffice = companySettings?.taxOffice || 'Boğaziçi Kurumlar VD';
  const supplierAddress = companySettings?.address || 'Büyükdere Cad. No:199 Levent, Beşiktaş / İstanbul';

  const customerName = doc.customerName || 'Müşteri';
  const customerTaxNo = (doc as any).customerTaxNumber || '9988776655';
  const customerTaxOffice = (doc as any).customerTaxOffice || 'Maslak VD';

  const subtotal = Number((doc as any).subtotal || (doc.grandTotal ? doc.grandTotal / 1.2 : 0)).toFixed(2);
  const taxTotal = Number((doc as any).taxTotal || (doc.grandTotal ? doc.grandTotal - Number(subtotal) : 0)).toFixed(2);
  const grandTotal = Number(doc.grandTotal || 0).toFixed(2);

  const items = doc.items || [];

  const invoiceLinesXml = items.map((item, index) => {
    const lineId = index + 1;
    const qty = item.quantity || 1;
    const price = Number(item.unitPrice || 0).toFixed(2);
    const lineTaxRate = Number(item.taxRate || 20);
    const lineTaxAmount = Number((item as any).taxAmount || (Number(price) * qty * (lineTaxRate / 100))).toFixed(2);
    const lineTotal = Number(item.total || (Number(price) * qty + Number(lineTaxAmount))).toFixed(2);

    return `
    <cac:InvoiceLine>
      <cbc:ID>${lineId}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="C62">${qty}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="${currency}">${(Number(price) * qty).toFixed(2)}</cbc:LineExtensionAmount>
      <cac:TaxTotal>
        <cbc:TaxAmount currencyID="${currency}">${lineTaxAmount}</cbc:TaxAmount>
        <cac:TaxSubtotal>
          <cbc:TaxableAmount currencyID="${currency}">${(Number(price) * qty).toFixed(2)}</cbc:TaxableAmount>
          <cbc:TaxAmount currencyID="${currency}">${lineTaxAmount}</cbc:TaxAmount>
          <cbc:Percent>${lineTaxRate}</cbc:Percent>
          <cac:TaxCategory>
            <cac:TaxScheme>
              <cbc:Name>KDV</cbc:Name>
              <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
            </cac:TaxScheme>
          </cac:TaxCategory>
        </cac:TaxSubtotal>
      </cac:TaxTotal>
      <cac:Item>
        <cbc:Description>${item.productName || 'Ürün / Hizmet'}</cbc:Description>
        <cbc:Name>${item.productName || 'Ürün'}</cbc:Name>
        <cac:SellersItemIdentification>
          <cbc:ID>${item.productSku || 'SKU'}</cbc:ID>
        </cac:SellersItemIdentification>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="${currency}">${price}</cbc:PriceAmount>
      </cac:Price>
    </cac:InvoiceLine>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ccts="urn:un:unece:uncefact:documentation:2"
         xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
         xmlns:ubltr="urn:oasis:names:specification:ubl:schema:xsd:TurkishCustomization"
         xmlns:qdt="urn:oasis:names:specification:ubl:schema:xsd:QualifiedDatatypes-2"
         xmlns:udt="urn:un:unece:uncefact:data:specification:UnqualifiedDataTypesSchemaModule:2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>TR1.2</cbc:CustomizationID>
  <cbc:ProfileID>TICARIFATURA</cbc:ProfileID>
  <cbc:ID>${invoiceNumber}</cbc:ID>
  <cbc:CopyIndicator>false</cbc:CopyIndicator>
  <cbc:UUID>${crypto.randomUUID()}</cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode>SATIS</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${currency}</cbc:DocumentCurrencyCode>
  <cbc:LineCountNumeric>${items.length || 1}</cbc:LineCountNumeric>
  
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="VKN">${supplierTaxNo}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${supplierName}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${supplierAddress}</cbc:StreetName>
        <cbc:CityName>İstanbul</cbc:CityName>
        <cbc:CountrySubentity>Türkiye</cbc:CountrySubentity>
        <cac:Country>
          <cbc:Name>Türkiye</cbc:Name>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cac:TaxScheme>
          <cbc:Name>${supplierTaxOffice}</cbc:Name>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="VKN">${customerTaxNo}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${customerName}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:CityName>İstanbul</cbc:CityName>
        <cac:Country>
          <cbc:Name>Türkiye</cbc:Name>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cac:TaxScheme>
          <cbc:Name>${customerTaxOffice}</cbc:Name>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${currency}">${taxTotal}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${currency}">${subtotal}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${currency}">${taxTotal}</cbc:TaxAmount>
      <cbc:Percent>20.00</cbc:Percent>
      <cac:TaxCategory>
        <cac:TaxScheme>
          <cbc:Name>KDV</cbc:Name>
          <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>

  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${currency}">${subtotal}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${currency}">${subtotal}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${currency}">${grandTotal}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${currency}">${grandTotal}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  ${invoiceLinesXml}
</Invoice>`;
}

export function downloadUblXml(doc: Sale | Proforma, companySettings: any): void {
  const xml = generateUblInvoiceXml(doc, companySettings);
  const docNumber = ('invoiceNumber' in doc ? (doc as Sale).invoiceNumber : (doc as Proforma).proformaNumber) || 'FATURA';
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${docNumber}_UBL_TR.xml`);
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
