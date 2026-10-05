-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'SALES', 'FINANCE', 'OPERATIONS', 'VIEWER');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "ProformaPaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'PENDING_SIGNATURE', 'SIGNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SaleDeliveryStatus" AS ENUM ('PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "SalePaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID');

-- CreateEnum
CREATE TYPE "ProductLifecycleStatus" AS ENUM ('STOCK', 'RESERVED', 'SOLD', 'DELIVERED', 'ACTIVE', 'SERVICE', 'RETURNED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'CHECK', 'OTHER');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'ENTERPRISE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'org-apex-01',
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "refreshTokenHash" TEXT,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'SALES',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'org-apex-01',
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxNumber" TEXT NOT NULL,
    "taxOffice" TEXT NOT NULL,
    "industry" TEXT,
    "creditLimit" DECIMAL(12,2),
    "notes" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerContact" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerAddress" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Türkiye',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'org-apex-01',
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "description" TEXT,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 20,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "warrantyMonths" INTEGER NOT NULL DEFAULT 24,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'org-apex-01',
    "quoteNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "salesPersonId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "paymentTerms" TEXT NOT NULL,
    "deliveryTerms" TEXT NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discountTotal" DECIMAL(12,2) NOT NULL,
    "taxTotal" DECIMAL(12,2) NOT NULL,
    "grandTotal" DECIMAL(12,2) NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "convertedToProformaId" TEXT,
    "convertedToContractId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteItem" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productSku" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "discountRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 20,
    "taxAmount" DECIMAL(12,2) NOT NULL,
    "netAmount" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proforma" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'org-apex-01',
    "proformaNumber" TEXT NOT NULL,
    "quoteId" TEXT,
    "customerId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "paymentTerms" TEXT NOT NULL,
    "deliveryTerms" TEXT NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discountTotal" DECIMAL(12,2) NOT NULL,
    "taxTotal" DECIMAL(12,2) NOT NULL,
    "grandTotal" DECIMAL(12,2) NOT NULL,
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "remainingAmount" DECIMAL(12,2) NOT NULL,
    "paymentStatus" "ProformaPaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proforma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProformaItem" (
    "id" TEXT NOT NULL,
    "proformaId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productSku" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "discountRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 20,
    "taxAmount" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "ProformaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'org-apex-01',
    "contractNumber" TEXT NOT NULL,
    "quoteId" TEXT,
    "proformaId" TEXT,
    "customerId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerRepresentative" TEXT NOT NULL,
    "customerTitle" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL,
    "sellerRepresentative" TEXT NOT NULL,
    "sellerTitle" TEXT NOT NULL,
    "contractDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "warrantyTerms" TEXT NOT NULL,
    "paymentTerms" TEXT NOT NULL,
    "deliveryTerms" TEXT NOT NULL,
    "specialClauses" TEXT[],
    "grandTotal" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "signedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'org-apex-01',
    "saleNumber" TEXT NOT NULL,
    "contractId" TEXT,
    "customerId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "salesPersonId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoiceNumber" TEXT NOT NULL,
    "grandTotal" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paymentStatus" "SalePaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "deliveryStatus" "SaleDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productSku" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "taxRate" DECIMAL(5,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSerial" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'org-apex-01',
    "internalId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT,
    "saleId" TEXT,
    "saleNumber" TEXT,
    "status" "ProductLifecycleStatus" NOT NULL DEFAULT 'STOCK',
    "location" TEXT DEFAULT 'Merkez Depo',
    "deliveryDate" TIMESTAMP(3),
    "warrantyStartDate" TIMESTAMP(3),
    "warrantyEndDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductSerial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductMovement" (
    "id" TEXT NOT NULL,
    "productSerialId" TEXT NOT NULL,
    "fromStatus" "ProductLifecycleStatus",
    "toStatus" "ProductLifecycleStatus" NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "note" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRecord" (
    "id" TEXT NOT NULL,
    "productSerialId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "issueDescription" TEXT NOT NULL,
    "resolution" TEXT,
    "technician" TEXT NOT NULL,
    "cost" DECIMAL(10,2) DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolvedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'org-apex-01',
    "paymentNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "proformaId" TEXT,
    "saleId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    "referenceNo" TEXT NOT NULL,
    "recordedBy" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'org-apex-01',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "userName" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityCode" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "details" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NumberSequence" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'org-apex-01',
    "year" INTEGER NOT NULL DEFAULT 2026,
    "quoteSeq" INTEGER NOT NULL DEFAULT 100,
    "proformaSeq" INTEGER NOT NULL DEFAULT 50,
    "contractSeq" INTEGER NOT NULL DEFAULT 30,
    "saleSeq" INTEGER NOT NULL DEFAULT 40,
    "productSeq" INTEGER NOT NULL DEFAULT 400,
    "customerSeq" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NumberSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanySettings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'org-apex-01',
    "companyName" TEXT NOT NULL,
    "commercialTitle" TEXT NOT NULL,
    "taxNumber" TEXT NOT NULL,
    "taxOffice" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "swift" TEXT NOT NULL,
    "authorizedSignatory" TEXT NOT NULL,
    "signatoryTitle" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanySettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_code_key" ON "Tenant"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_code_key" ON "Customer"("code");

-- CreateIndex
CREATE INDEX "Customer_tenantId_idx" ON "Customer"("tenantId");

-- CreateIndex
CREATE INDEX "Customer_code_idx" ON "Customer"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_tenantId_idx" ON "Product"("tenantId");

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_quoteNumber_key" ON "Quote"("quoteNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_convertedToProformaId_key" ON "Quote"("convertedToProformaId");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_convertedToContractId_key" ON "Quote"("convertedToContractId");

-- CreateIndex
CREATE INDEX "Quote_tenantId_idx" ON "Quote"("tenantId");

-- CreateIndex
CREATE INDEX "Quote_customerId_idx" ON "Quote"("customerId");

-- CreateIndex
CREATE INDEX "Quote_quoteNumber_idx" ON "Quote"("quoteNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Proforma_proformaNumber_key" ON "Proforma"("proformaNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Proforma_quoteId_key" ON "Proforma"("quoteId");

-- CreateIndex
CREATE INDEX "Proforma_tenantId_idx" ON "Proforma"("tenantId");

-- CreateIndex
CREATE INDEX "Proforma_customerId_idx" ON "Proforma"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_contractNumber_key" ON "Contract"("contractNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_quoteId_key" ON "Contract"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_proformaId_key" ON "Contract"("proformaId");

-- CreateIndex
CREATE INDEX "Contract_tenantId_idx" ON "Contract"("tenantId");

-- CreateIndex
CREATE INDEX "Contract_customerId_idx" ON "Contract"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_saleNumber_key" ON "Sale"("saleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_contractId_key" ON "Sale"("contractId");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_invoiceNumber_key" ON "Sale"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Sale_tenantId_idx" ON "Sale"("tenantId");

-- CreateIndex
CREATE INDEX "Sale_customerId_idx" ON "Sale"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSerial_internalId_key" ON "ProductSerial"("internalId");

-- CreateIndex
CREATE INDEX "ProductSerial_tenantId_idx" ON "ProductSerial"("tenantId");

-- CreateIndex
CREATE INDEX "ProductSerial_productId_idx" ON "ProductSerial"("productId");

-- CreateIndex
CREATE INDEX "ProductSerial_customerId_idx" ON "ProductSerial"("customerId");

-- CreateIndex
CREATE INDEX "ProductSerial_internalId_idx" ON "ProductSerial"("internalId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentNumber_key" ON "Payment"("paymentNumber");

-- CreateIndex
CREATE INDEX "Payment_tenantId_idx" ON "Payment"("tenantId");

-- CreateIndex
CREATE INDEX "Payment_customerId_idx" ON "Payment"("customerId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "NumberSequence_tenantId_idx" ON "NumberSequence"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "NumberSequence_tenantId_year_key" ON "NumberSequence"("tenantId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "CompanySettings_tenantId_key" ON "CompanySettings"("tenantId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerContact" ADD CONSTRAINT "CustomerContact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_salesPersonId_fkey" FOREIGN KEY ("salesPersonId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proforma" ADD CONSTRAINT "Proforma_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proforma" ADD CONSTRAINT "Proforma_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaItem" ADD CONSTRAINT "ProformaItem_proformaId_fkey" FOREIGN KEY ("proformaId") REFERENCES "Proforma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_proformaId_fkey" FOREIGN KEY ("proformaId") REFERENCES "Proforma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_salesPersonId_fkey" FOREIGN KEY ("salesPersonId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSerial" ADD CONSTRAINT "ProductSerial_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSerial" ADD CONSTRAINT "ProductSerial_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSerial" ADD CONSTRAINT "ProductSerial_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMovement" ADD CONSTRAINT "ProductMovement_productSerialId_fkey" FOREIGN KEY ("productSerialId") REFERENCES "ProductSerial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRecord" ADD CONSTRAINT "ServiceRecord_productSerialId_fkey" FOREIGN KEY ("productSerialId") REFERENCES "ProductSerial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_proformaId_fkey" FOREIGN KEY ("proformaId") REFERENCES "Proforma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

