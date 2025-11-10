"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Define the shape of our API data
interface TrendData {
  month: string;
  count: number;
  total: number;
}

export default function InvoiceTrendChart() {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/invoice-trends");
        const trends: TrendData[] = await response.json();
        setData(trends);
      } catch (error) {
        console.error("Failed to fetch invoice trends:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <Card className="bg-gray-900 border-gray-800 col-span-2">
      <CardHeader>
        <CardTitle className="text-gray-400 font-medium">
          Invoice Volume + Value Trend
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Loading chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis
                yAxisId="left"
                stroke="hsl(var(--primary))"
                fontSize={12}
                label={{
                  value: "Invoice Count",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--primary))",
                  dy: 40,
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10b981"
                fontSize={12}
                label={{
                  value: "Total Spend (€)",
                  angle: 90,
                  position: "insideRight",
                  fill: "#10b981",
                  dy: -40,
                }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
                labelStyle={{ color: "#f9fafb" }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Invoices"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="total"
                stroke="#10b981"
                strokeWidth={2}
                name="Total Spend"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}