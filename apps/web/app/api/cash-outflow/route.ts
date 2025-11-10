import { NextResponse } from 'next/server';
import db from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Define the shape of our raw query result
interface OutflowData {
  bucket: string;
  total: number;
}

export async function GET() {
  try {
    const data = await db.$queryRaw<OutflowData[]>(
      Prisma.sql`
        SELECT
          sub.bucket,
          SUM(sub."totalAmount")::float as total
        FROM (
          -- This is our subquery. It runs first.
          -- It assigns a bucket and a sort_order to every unpaid invoice.
          SELECT
            "totalAmount",
            CASE
              WHEN "dueDate" BETWEEN NOW() AND NOW() + INTERVAL '7 days' THEN '0 - 7 days'
              WHEN "dueDate" BETWEEN NOW() + INTERVAL '8 days' AND NOW() + INTERVAL '30 days' THEN '8 - 30 days'
              WHEN "dueDate" BETWEEN NOW() + INTERVAL '31 days' AND NOW() + INTERVAL '60 days' THEN '31 - 60 days'
              WHEN "dueDate" > NOW() + INTERVAL '60 days' THEN '60+ days'
              ELSE 'Overdue'
            END as bucket,
            CASE
              WHEN "dueDate" BETWEEN NOW() AND NOW() + INTERVAL '7 days' THEN 1
              WHEN "dueDate" BETWEEN NOW() + INTERVAL '8 days' AND NOW() + INTERVAL '30 days' THEN 2
              WHEN "dueDate" BETWEEN NOW() + INTERVAL '31 days' AND NOW() + INTERVAL '60 days' THEN 3
              WHEN "dueDate" > NOW() + INTERVAL '60 days' THEN 4
              ELSE 0
            END as sort_order
          FROM "Invoice"
          WHERE "status" IN ('PENDING', 'OVERDUE')
        ) as sub
        -- The outer query now groups by the pre-calculated buckets and sort order.
        GROUP BY sub.bucket, sub.sort_order
        ORDER BY sub.sort_order;
      `
    );

    return NextResponse.json(data);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'An error occurred while fetching cash outflow.' },
      { status: 500 }
    );
  }
}