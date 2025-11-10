import { PrismaClient, InvoiceStatus } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Helper to get a random status
function getRandomStatus(): InvoiceStatus {
  const statuses: InvoiceStatus[] = ['PENDING', 'PAID', 'OVERDUE'];
  return statuses[Math.floor(Math.random() * statuses.length)]!;
}

// Helper to handle potentially empty or invalid dates
function parseDueDate(invoiceDateStr: string, dueDateStr: string | null | undefined): Date {
  if (dueDateStr && new Date(dueDateStr).toString() !== 'Invalid Date') {
    return new Date(dueDateStr);
  }
  // Fallback: Set due date 30 days after the issue date
  const issueDate = new Date(invoiceDateStr);
  issueDate.setDate(issueDate.getDate() + 30);
  return issueDate;
}

// --- Define Types based on your JSON structure ---

type LlmValue<T> = {
  value: T;
  [key: string]: any; 
};

type LlmLineItem = {
  description: LlmValue<string>;
  quantity: LlmValue<number>;
  unitPrice: LlmValue<number>;
  category: LlmValue<string>;
};

type LlmData = {
  invoice?: LlmValue<{
    invoiceId: LlmValue<string>;
    invoiceDate: LlmValue<string>;
  }>;
  vendor?: LlmValue<{
    vendorName: LlmValue<string>;
    vendorAddress: LlmValue<string>;
    vendorTaxId: LlmValue<string>;
  }>;
  payment?: LlmValue<{
    dueDate: LlmValue<string>;
  }>;
  summary?: LlmValue<{
    invoiceTotal: LlmValue<number>;
    currencySymbol: LlmValue<string>;
  }>;
  lineItems?: LlmValue<LlmLineItem[]>;
};

type JsonDoc = {
  _id: string;
  extractedData: {
    llmData: LlmData;
  };
};

// --- Main Seeding Function ---

async function main() {
  console.log('Starting the seed process...');

  // 1. Read the JSON file
  const jsonPath = path.join(__dirname, '../../../data/Analytics_Test_Data.json');
  const fileContent = await fs.readFile(jsonPath, 'utf-8');
  const jsonData = JSON.parse(fileContent) as JsonDoc[];

  console.log(`Found ${jsonData.length} documents to process.`);

  // 2. Clear existing data
  await prisma.lineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.vendor.deleteMany();
  console.log('Cleared existing data.');

  // 3. Loop and ingest each document
  for (const doc of jsonData) {
    try {
      const data = doc.extractedData.llmData;

      // --- Defensive Data Extraction ---
      // We use optional chaining (?.) to safely access nested properties.
      
      const vendorName = data.vendor?.value?.vendorName?.value;
      const invoiceNumber = data.invoice?.value?.invoiceId?.value;
      const totalAmountRaw = data.summary?.value?.invoiceTotal?.value;
      const invoiceDateStr = data.invoice?.value?.invoiceDate?.value;
      const lineItemsArray = data.lineItems?.value; // This might be undefined, or not an array

      // --- Validation ---
      // If critical data is missing, skip this document entirely.
      if (!vendorName || !invoiceNumber || totalAmountRaw === undefined || !invoiceDateStr) {
        console.warn(`Skipping document (ID: ${doc._id}): Missing critical data (vendor, invoice #, total, or date).`);
        continue; // Skips to the next doc in the loop
      }

      // 3.1. Upsert Vendor
      const vendor = await prisma.vendor.upsert({
        where: { name: vendorName },
        update: {},
        create: {
          name: vendorName,
          address: data.vendor?.value?.vendorAddress?.value || null,
          taxId: data.vendor?.value?.vendorTaxId?.value || null,
        },
      });

      // 3.2. Prepare Invoice Data
      const invoiceDate = new Date(invoiceDateStr);
      const dueDate = parseDueDate(invoiceDateStr, data.payment?.value?.dueDate?.value);
      const totalAmount = Math.abs(totalAmountRaw);
      const currency = data.summary?.value?.currencySymbol?.value || 'EUR';

      // 3.3. Create Invoice and nested LineItems
      await prisma.invoice.create({
        data: {
          invoiceNumber: invoiceNumber,
          issueDate: invoiceDate,
          dueDate: dueDate,
          totalAmount: totalAmount,
          currency: currency,
          status: getRandomStatus(),
          vendorId: vendor.id,

          // --- CRITICAL FIX ---
          // Only create line items if lineItemsArray is *actually an array*.
          lineItems: {
            create: Array.isArray(lineItemsArray)
              ? lineItemsArray.map(item => ({
                  description: item.description?.value || 'N/A', // Use fallbacks
                  quantity: item.quantity?.value || 1,
                  unitPrice: item.unitPrice?.value || 0,
                  category: item.category?.value || 'Operations', // Fallback category
                }))
              : undefined, // If not an array, create no line items
          },
        },
      });

      // console.log(`Successfully processed invoice: ${invoiceNumber}`); // Optional: uncomment for less noise

    } catch (e: any) {
      // This will catch any unexpected errors we didn't plan for.
      console.error(`Failed to process document (ID: ${doc._id}): ${e.message}`);
    }
  }

  console.log('Seed process finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });