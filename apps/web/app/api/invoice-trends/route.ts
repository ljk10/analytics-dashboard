import { NextResponse } from 'next/server';
import db from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    // This is a raw SQL query. It's the most reliable way to
    // group by month/year across different databases.
    const trends = await db.$queryRaw<
      { month: string; count: number; total: number }[]
    >(
      Prisma.sql`
            SELECT
              to_char("issueDate", 'YYYY-MM') as month,
              COUNT(*)::int as count,
              SUM("totalAmount")::float as total
            FROM "Invoice"
            WHERE "issueDate" >= NOW() - INTERVAL '12 months'
            GROUP BY month
            ORDER BY month ASC;
          `
    );

    // Helper to format 'YYYY-MM' to 'MMM' (e.g., '2025-01' -> 'Jan')
    const formatMonth = (monthString: string) => {
      const [year, month] = monthString.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' });
    };

    const formattedData = trends.map(item => ({
      ...item,
      // Format month and ensure total is a number
      month: formatMonth(item.month), 
      total: Number(item.total.toFixed(2)),
    }));

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'An error occurred while fetching invoice trends.' },
      { status: 500 }
    );
  }
}