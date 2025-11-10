"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface VendorData {
  name: string;
  total: number;
}

export default function SpendByVendorChart() {
  const [data, setData] = useState<VendorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/vendors/top10");
        const vendors: VendorData[] = await response.json();
        setData(vendors);
      } catch (error) {
        console.error("Failed to fetch top vendors:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatCurrency = (value: number) => `€${value.toFixed(0)}`;

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-300 font-medium">
          Spend by Vendor (Top 10)
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Loading chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical" // This makes it a horizontal bar chart
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                type="number"
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={formatCurrency}
              />
              <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#9ca3af"
                    fontSize={12}
                    width={150} // Increased width for more space
                    axisLine={false}
                    tickLine={false}
                    tickMargin={5} // Adds a small margin from the bar
                  />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
                labelStyle={{ color: "#f9fafb" }}
                formatter={(value: number) => [formatCurrency(value), "Total Spend"]}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}