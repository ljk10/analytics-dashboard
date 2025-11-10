"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Define the shape of our API data
export type Invoice = {
  id: number;
  invoiceNumber: string;
  issueDate: string;
  status: string;
  totalAmount: number;
  vendorName: string;
};

// --- 1. Define the Columns ---
export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "vendorName",
    header: "Vendor",
  },
  {
    accessorKey: "invoiceNumber",
    header: "Invoice #",
  },
  {
    accessorKey: "issueDate",
    header: "Date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      
      // FIX: Set badge variants based on status for dark mode visibility
      let variant: "default" | "secondary" | "destructive" = "default";
      if (status === "PAID") variant = "secondary";
      if (status === "OVERDUE") variant = "destructive";

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "totalAmount",
    header: () => <div className="text-right">Net Value</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"));
      const formatted = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(amount);
      // FIX: Ensure text is light
      return <div className="text-right font-medium text-gray-200">{formatted}</div>;
    },
  },
];

// --- 2. Create the DataTable Component ---
export default function InvoiceTable() {
  const [data, setData] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  // Fetch data
  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // We'll use a local search, so just fetch all
        const response = await fetch("/api/invoices");
        const json: Invoice[] = await response.json();
        setData(json);
      } catch (e) {
        console.error("Failed to fetch invoices", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    // Use a global filter for simple search
    
  });

  return (
    // FIX: Set card to dark background
    <Card className="bg-gray-800 border-gray-700 col-span-3">
      <CardHeader>
        {/* FIX: Set title text to light gray */}
        <CardTitle className="text-gray-300 font-medium">
          Invoices by Vendor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center py-4">
          <Input
            placeholder="Search by vendor or invoice #..."
            // Filter on the 'vendorName' column
            onChange={(event) =>
              table.getColumn("vendorName")?.setFilterValue(event.target.value)
            }
            // FIX: Set input to dark background
            className="max-w-sm bg-gray-900 border-gray-700 text-white"
          />
        </div>
        <div className="rounded-md border border-gray-700">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-gray-700 hover:bg-gray-700/50">
                  {headerGroup.headers.map((header) => {
                    return (
                      // FIX: Set table header text to light gray
                      <TableHead key={header.id} className="text-gray-300">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  // FIX: Set row text to light color
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-gray-700 text-gray-200 hover:bg-gray-700/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-400" // FIX: Light text for empty state
                  >
                    {loading ? "Loading invoices..." : "No results."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}