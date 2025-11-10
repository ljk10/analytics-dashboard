import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import OverviewCards from "@/components/overview-cards";
import InvoiceTrendChart from "@/components/invoice-trend-chart";
import SpendByVendorChart from "@/components/spend-by-vendor-chart";
import SpendByCategoryChart from "@/components/spend-by-category-chart";
import CashOutflowChart from "@/components/cash-outflow-chart";
import InvoiceTable from "@/components/invoice-table";

export default function DashboardPage() {
  return (
    // Main wrapper: light gray background, dark text
    <div className="flex min-h-screen bg-secondary text-foreground">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <Header />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          
          <div className="md:col-span-3">
            <OverviewCards />
          </div>

          <div className="md:col-span-2">
            <InvoiceTrendChart />
          </div>
          
          <div className="md:col-span-1">
            <SpendByVendorChart />
          </div>

          <div className="md:col-span-1">
            <SpendByCategoryChart />
          </div>
          
          <div className="md:col-span-2">
            <CashOutflowChart />
          </div>

          <div className="md:col-span-3">
            <InvoiceTable />
          </div>

        </div>
      </main>
    </div>
  );
}