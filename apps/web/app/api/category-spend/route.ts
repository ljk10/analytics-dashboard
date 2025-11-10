import { NextResponse } from 'next/server';
import db from '@/lib/prisma';

export async function GET() {
  try {
    const categorySpend = await db.lineItem.groupBy({
      by: ['category'],
      _sum: {
        unitPrice: true, // Summing the unitPrice as the line item total
      },
      orderBy: {
        _sum: {
          unitPrice: 'desc',
        },
      },
    });

    // Format the data for Recharts (needs 'name' and 'value')
    const formattedData = categorySpend.map(item => ({
      name: item.category,
      value: item._sum.unitPrice?.toNumber() || 0,
    }));

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'An error occurred while fetching category spend.' },
      { status: 500 }
    );
  }
}