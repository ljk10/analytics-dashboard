"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

// Define the shape of our data
interface StatsData {
  totalSpend: number;
  totalInvoices: number;
  averageInvoiceValue: number;
  documentsUploaded: number;
}

// A reusable card component
function StatCard({ title, value, comparisonText, comparisonColor = "text-green-500" }: { title: string, value: string, comparisonText: string, comparisonColor?: string }) {
  return (
    <Card className="bg-gray-800 border-gray-700"> {/* Dark card background */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {/* FIX: Changed text to a light gray */}
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* This text defaults to white (card-foreground) */}
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${comparisonColor}`}>{comparisonText}</p>
      </CardContent>
    </Card>
  );
}

export default function OverviewCards() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/stats");
        const stats: StatsData = await response.json();
        setData(stats);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  if (loading || !data) {
    // Skeleton loaders
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-800 border-gray-700 h-[108px] animate-pulse" />
        <Card className="bg-gray-800 border-gray-700 h-[108px] animate-pulse" />
        <Card className="bg-gray-800 border-gray-700 h-[108px] animate-pulse" />
        <Card className="bg-gray-800 border-gray-700 h-[108px] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Spend (YTD)"
        value={formatCurrency(data.totalSpend)}
        comparisonText="+8.2% from last month"
      />
      <StatCard
        title="Total Invoices Processed"
        value={data.totalInvoices.toString()}
        comparisonText="+8.2% from last month"
      />
      <StatCard
        title="Documents Uploaded"
        value={data.documentsUploaded.toString()}
        comparisonText="8 less from last month"
        comparisonColor="text-red-500" // Example of different color
      />
      <StatCard
        title="Average Invoice Value"
        value={formatCurrency(data.averageInvoiceValue)}
        comparisonText="+8.2% from last month"
      />
    </div>
  );
}