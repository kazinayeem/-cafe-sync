import { useState, useEffect } from "react";
import { useGetSalesSummaryQuery } from "@/services/orderApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Define the correct types to match what is being passed to generatePDF
interface OrderItem {
  product: { name: string };
  size: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  table?: { tableNumber: string };
  status: string;
  totalPrice: number;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[]; // <-- ADD THIS LINE
}

interface StatusBreakdownItem {
  _id: string;
  count: number;
}

const SummaryManagement = () => {
  const [filter, setFilter] = useState<"today" | "week" | "month" | "custom">(
    "today"
  );
  const [status, setStatus] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const apiFilter: "today" | "week" | "month" | undefined =
    filter === "custom" ? undefined : filter;

  const { data, isLoading, refetch } = useGetSalesSummaryQuery({
    filter: apiFilter,
    startDate: filter === "custom" && startDate ? startDate : undefined,
    endDate: filter === "custom" && endDate ? endDate : undefined,
    status: status !== "all" ? status : undefined,
  });

  useEffect(() => {
    refetch();
  }, [filter, status, startDate, endDate, refetch]);

  const handleApplyFilter = () => refetch();

  const summary = data?.summary ?? { totalOrders: 0, totalSales: 0 };
  const statusBreakdown = data?.statusBreakdown ?? [];
  const allData = data?.allData ?? {};

  const getStatusCount = (status: string) =>
    statusBreakdown.find((s: StatusBreakdownItem) => s._id === status)?.count ??
    0;

  const filteredOrders: Order[] = selectedStatus
    ? (allData[selectedStatus as keyof typeof allData] as Order[]) ?? []
    : (Object.values(allData).flat() as Order[]);

  const formatPrice = (price: number) => `৳${price.toLocaleString("en-US")}`;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusVariant = (status: string) => {
    switch (status) {
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

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header & Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">📊 Sales Summary Management</h1>
        <Button
          onClick={() =>
            generatePDF(
              filter,
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select
                value={filter}
                onValueChange={(val) => setFilter(val as typeof filter)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Order Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="served">Served</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filter === "custom" && (
              <>
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
              </>
            )}

            {filter !== "custom" && (
              <div className="space-y-2">
                <label className="text-sm font-medium opacity-0">Apply</label>
                <Button className="w-full" onClick={handleApplyFilter}>
                  Apply Filters
                </Button>
              </div>
            )}
          </div>

          {filter === "custom" && (
            <div className="mt-4">
              <Button className="w-full" onClick={handleApplyFilter}>
                Apply Filters
              </Button>
            </div>
          )}
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
                        <td className="p-2">
                          {order.table?.tableNumber || "-"}
                        </td>
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
                  filter,
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
