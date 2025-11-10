import { NextResponse } from 'next/server';
import db from '@/lib/prisma';
export async function GET() {
  try {
    // 1. Get total invoice count
    const totalInvoices = await db.invoice.count();

    // 2. Get total spend using Prisma's aggregate function
    const totalSpendAggregate = await db.invoice.aggregate({
      _sum: {
        totalAmount: true,
      },
    });

    const totalSpend = totalSpendAggregate._sum.totalAmount?.toNumber() || 0;

    // 3. Calculate average
    const averageInvoiceValue = totalInvoices > 0 ? totalSpend / totalInvoices : 0;

    // 4. Return the data
    const data = {
      totalSpend: totalSpend,
      totalInvoices: totalInvoices,
      averageInvoiceValue: averageInvoiceValue,
      // We'll mock the "Documents Uploaded" for now
      documentsUploaded: 50, // This is just the file count
    };

    return NextResponse.json(data);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'An error occurred while fetching stats.' },
      { status: 500 }
    );
  }
}