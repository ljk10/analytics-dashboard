import { NextResponse } from 'next/server';
import db from '@/lib/prisma';

export async function GET() {
  try {
    const topVendors = await db.invoice.groupBy({
      by: ['vendorId'], // Group by the vendor's ID
      _sum: {
        totalAmount: true, // Sum their total spending
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc', // Order by the highest spenders
        },
      },
      take: 10, // Get only the top 10
    });

    // The query above only gives us vendorId, not the name.
    // We need to fetch the names for those IDs.
    const vendorIds = topVendors.map(v => v.vendorId);

    const vendors = await db.vendor.findMany({
      where: {
        id: {
          in: vendorIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Create a quick-lookup map for vendor names
    const vendorMap = new Map(vendors.map(v => [v.id, v.name]));

    // Combine the data, format it for the chart, and sort it
    const formattedData = topVendors.map(vendor => ({
      name: vendorMap.get(vendor.vendorId) || 'Unknown',
      total: vendor._sum.totalAmount?.toNumber() || 0,
    }))
    // Sort from lowest to highest so the chart renders nicely
    .sort((a, b) => a.total - b.total); 

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'An error occurred while fetching top vendors.' },
      { status: 500 }
    );
  }
}