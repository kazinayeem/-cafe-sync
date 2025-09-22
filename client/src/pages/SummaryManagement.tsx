import { useState, useEffect } from "react";
import { useGetSalesSummaryQuery } from "@/services/orderApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { generatePDF } from "@/components/GeneratePdf";
import Swal from "sweetalert2";

interface OrderItem {
  product: { name: string };
  size: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  table?: { name: string };
  customerName?: string;
  status: string;
  totalPrice: number;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
  customOrderID?: string;
}

interface StatusBreakdownItem {
  _id: string;
  count: number;
}

const SummaryManagement = () => {
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [openDetails, setOpenDetails] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // --- API Params ---
  const { data, isLoading, refetch } = useGetSalesSummaryQuery({
    startDate: new Date(`${startDate}T00:00:00+06:00`).toISOString(),
    endDate: new Date(`${endDate}T23:59:59+06:00`).toISOString(),
    status: status !== "all" ? status : undefined,
    search: search,
  });

  useEffect(() => {
    const fetchData = async () => {
      Swal.fire({
        title: "Loading...",
        text: "Fetching orders, please wait.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        await refetch();
      } finally {
        Swal.close();
      }
    };

    fetchData();
  }, [status, startDate, endDate, search, refetch]);

  // --- Extracted Data ---
  const summary = data?.summary ?? { totalOrders: 0, totalSales: 0 };
  const statusBreakdown = data?.statusBreakdown ?? [];
  const allData = data?.allData ?? {};

  const getStatusCount = (st: string) =>
    statusBreakdown.find((s: StatusBreakdownItem) => s._id === st)?.count ?? 0;

  const filteredOrders: Order[] = selectedStatus
    ? allData[selectedStatus as keyof typeof allData] ?? []
    : Object.values(allData).flat();

  // --- Utils ---
  const formatPrice = (price: number) => `৳${price.toLocaleString("en-US")}`;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusVariant = (st: string) => {
    switch (st) {
      case "pending":
        return "secondary";
      case "preparing":
        return "default";
      case "served":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  // --- Render ---
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">📊 Sales Summary Management</h1>
        <Button
          onClick={() =>
            generatePDF(
              "custom",
              startDate,
              endDate,
              status,
              summary,
              filteredOrders
            )
          }
          className="md:w-auto w-full"
        >
          Export PDF
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 items-end">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Order Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border rounded p-2 w-full"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="served">Served</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                disabled
                type="text"
                placeholder="Search by Order ID or Product Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Custom Dates */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <Card key={i} className="shadow-md">
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{summary.totalOrders}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => {
                    setSelectedStatus(null);
                    setOpenDetails(true);
                  }}
                >
                  See Details
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {formatPrice(summary.totalSales)}
                </p>
              </CardContent>
            </Card>

            {["pending", "preparing", "served", "cancelled"].map((st) => (
              <Card key={st} className="shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg capitalize">
                    {st} Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{getStatusCount(st)}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => {
                      setSelectedStatus(st);
                      setOpenDetails(true);
                    }}
                  >
                    See Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={openDetails} onOpenChange={setOpenDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedStatus
                ? `${
                    selectedStatus.charAt(0).toUpperCase() +
                    selectedStatus.slice(1)
                  } Orders`
                : "All Orders"}
            </DialogTitle>
            <DialogDescription>
              Showing {filteredOrders.length} orders
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-auto flex-1">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No orders found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">#</th>
                      <th className="p-2 text-left">Table</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Total</th>
                      <th className="p-2 text-left">Payment</th>
                      <th className="p-2 text-left">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, i) => (
                      <tr
                        key={order._id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="p-2">{i + 1}</td>
                        <td className="p-2">{order.table?.name || "-"}</td>
                        <td className="p-2">
                          <Badge variant={getStatusVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="p-2 font-medium">
                          {formatPrice(order.totalPrice)}
                        </td>
                        <td className="p-2 capitalize">
                          {order.paymentMethod}
                        </td>
                        <td className="p-2">{formatDate(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() =>
                generatePDF(
                  "custom",
                  startDate,
                  endDate,
                  status,
                  summary,
                  filteredOrders
                )
              }
            >
              Export as PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SummaryManagement;
