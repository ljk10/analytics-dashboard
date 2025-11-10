import { NextResponse } from 'next/server';
import db from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Create the 'where' filter for Prisma
    const where: Prisma.InvoiceWhereInput = {
      // 'OR' means it can match *either* the vendor name *or* the invoice number
      OR: [
        {
          // Search by vendor name
          vendor: {
            name: {
              contains: search,
              mode: 'insensitive', // Case-insensitive
            },
          },
        },
        {
          // Search by invoice number
          invoiceNumber: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    };

    const invoices = await db.invoice.findMany({
      where: where,
      include: {
        vendor: { // We need to include the vendor's data
          select: {
            name: true, // Only select the vendor's name
          },
        },
      },
      orderBy: {
        issueDate: 'desc', // Show most recent invoices first
      },
    });

    // Format the data to be clean for the frontend
    const formattedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate.toISOString().split('T')[0], // Format as "YYYY-MM-DD"
      status: invoice.status,
      totalAmount: invoice.totalAmount.toNumber(),
      vendorName: invoice.vendor.name,
    }));

    return NextResponse.json(formattedInvoices);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'An error occurred while fetching invoices.' },
      { status: 500 }
    );
  }
}