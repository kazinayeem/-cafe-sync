import { useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import {
  useDeleteOrderMutation,
  useGetOrdersQuery,
  useUpdateOrderMutation,
} from "@/services/orderApi";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Loader, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import type { Order, OrdersResponse } from "@/types/User";

const OrdersDashboard = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const ref: RefObject<HTMLDivElement | null> = useRef(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [status, setStatus] = useState<
    "pending" | "preparing" | "served" | "cancelled" | ""
  >("");
  const today = new Date();
  const localToday = today.toLocaleDateString("en-CA", {
    timeZone: "Asia/Dhaka",
  });
  const [startDate, setStartDate] = useState<string>(localToday);
  const [endDate, setEndDate] = useState<string>(localToday);
  const start = new Date(`${startDate}T00:00:00+06:00`).toISOString();
  const end = new Date(`${endDate}T23:59:59+06:00`).toISOString();

  const [query, setQuery] = useState<{
    page: number;
    limit: number;
    status: "pending" | "preparing" | "served" | "cancelled" | "";
    startDate: string;
    endDate: string;
    orderId?: string;
  }>({
    page: 1,
    limit: 20,
    status: "",
    startDate: start,
    endDate: end,
  });

  const {
    data: response,
    isLoading,
    isError,
    isFetching,
  } = useGetOrdersQuery(
    {
      page: query.page,
      limit: query.limit,
      status: query.status || undefined,
      startDate: query.startDate || undefined,
      endDate: query.endDate || undefined,
      orderId: query.orderId,
    },
    { refetchOnMountOrArgChange: true }
  ) as {
    data?: OrdersResponse;
    isLoading: boolean;
    isError: boolean;
    isFetching: boolean;
  };

  const [deleteOrder] = useDeleteOrderMutation();
  const [updateOrder] = useUpdateOrderMutation();

  const orders = response?.data ?? [];
  const totalPages = response?.pagination?.totalPages ?? 1;

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrder({ id: orderId, data: { status: newStatus } }).unwrap();
      if (activeOrder && activeOrder._id === orderId) {
        setActiveOrder({ ...activeOrder, status: newStatus });
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSearch = () => {
    setQuery({
      page: 1,
      limit,
      status,
      startDate: start,
      endDate: end,
      ...(searchTerm ? { orderId: searchTerm } : {}),
    });
  };

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    setQuery((prev) => ({ ...prev, page: p }));
  };

  useOutsideClick(ref as React.RefObject<HTMLDivElement>, () =>
    setActiveOrder(null)
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 rounded-xl shadow-lg">
        <p className="text-center text-base font-medium text-red-500 dark:text-red-400 px-6">
          ⚠️ Failed to load orders. Please check your connection and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 lg:p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">
          Orders Dashboard
        </h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setStatus("")}
            className={cn(
              "px-6 py-2 rounded-full font-medium transition-all duration-300",
              status === ""
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            )}
          >
            All Orders
          </Button>
          <Button
            onClick={() => setStatus("preparing")}
            className={cn(
              "px-6 py-2 rounded-full font-medium transition-all duration-300",
              status === "preparing"
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            )}
          >
            In Progress
          </Button>
          <Button
            onClick={() => setStatus("served")}
            className={cn(
              "px-6 py-2 rounded-full font-medium transition-all duration-300",
              status === "served"
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            )}
          >
            Completed
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Filter Orders
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Items per page
            </label>
            <Select
              value={String(limit)}
              onValueChange={(val) => setLimit(Number(val))}
            >
              <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 items</SelectItem>
                <SelectItem value="10">10 items</SelectItem>
                <SelectItem value="20">20 items</SelectItem>
                <SelectItem value="100">100 items</SelectItem>
                <SelectItem value="200">200 items</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Search Order ID
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter Order ID..."
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Status
            </label>
            <Select
              value={status || "all"}
              onValueChange={(val) =>
                setStatus(
                  val === "all"
                    ? ""
                    : (val as "pending" | "preparing" | "served" | "cancelled")
                )
              }
            >
              <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg">
                <SelectValue placeholder="Filter by status" />
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

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSearch}
            disabled={isFetching}
            className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg px-6 py-2.5 font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? (
              <span className="flex items-center">
                <Loader className="animate-spin w-5 h-5 mr-2" />
                Searching...
              </span>
            ) : (
              <span className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Apply Filters
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-center">
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
              No orders found for the selected filters.
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <motion.div
              key={order._id}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveOrder(order)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={cn(
                        "rounded-full w-10 h-10 text-white flex items-center justify-center font-semibold",
                        order.status === "preparing"
                          ? "bg-orange-500"
                          : "bg-green-500"
                      )}
                    >
                      TA
                    </span>
                    <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                      Takeaway
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Order #{order._id.substring(0, 10)} |{" "}
                    {order.table?.name || "Takeaway"}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={cn(
                      "text-xs font-semibold px-3 py-1 rounded-full",
                      order.status === "preparing"
                        ? "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
                        : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                    )}
                  >
                    {order.status === "preparing" ? "In Progress" : "Ready"}
                  </span>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-4">
                {order.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        {item.quantity}x
                      </span>
                      <span className="text-gray-700 dark:text-gray-200">
                        {item.product?.name ?? "Product deleted"}
                      </span>
                    </div>
                    <span className="text-gray-800 dark:text-gray-100 font-semibold">
                      ${(item.quantity * item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    +{order.items.length - 3} more items
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  Total ${order.totalPrice.toFixed(2)}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="text-sm font-medium text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Details
                  </Button>
                  <Button
                    className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-all duration-300"
                    disabled={isFetching}
                  >
                    Pay Bill
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <Pagination className="flex-wrap justify-center">
          <PaginationContent>
            <PaginationPrevious>
              <Button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="sr-only">Previous</span>
                &lt;
              </Button>
            </PaginationPrevious>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNumber =
                i + Math.max(1, Math.min(page - 2, totalPages - 4));
              return (
                <PaginationItem key={i}>
                  <Button
                    onClick={() => goToPage(pageNumber)}
                    className={cn(
                      "h-10 w-10 rounded-full",
                      page === pageNumber
                        ? "bg-indigo-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    {pageNumber}
                  </Button>
                </PaginationItem>
              );
            })}
            <PaginationNext>
              <Button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="sr-only">Next</span>
                &gt;
              </Button>
            </PaginationNext>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Active Order Modal */}
      <AnimatePresence>
        {activeOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 z-50 grid place-items-center p-4"
          >
            <motion.div
              ref={ref}
              layout
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setActiveOrder(null)}
                className="absolute top-4 right-4 rounded-full bg-gray-200 dark:bg-gray-800 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Order Details
              </h2>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">
                ID: {activeOrder._id}
              </p>

              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xl font-semibold text-gray-800 dark:text-white">
                    Total: ${activeOrder.totalPrice.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Payment: {activeOrder.paymentMethod}
                  </p>
                </div>
                {activeOrder?.table && (
                  <div className="text-right mt-4 sm:mt-0">
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      Table: {activeOrder.table.name}
                    </p>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        activeOrder.table.status === "occupied"
                          ? "text-red-500"
                          : "text-green-500"
                      )}
                    >
                      Status: {activeOrder.table.status}
                    </p>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Items
              </h3>
              <div className="flex flex-col gap-4 max-h-80 overflow-y-auto">
                {activeOrder?.items?.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700"
                  >
                     {/* {item.product?.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 text-xs font-medium">
                        No Image
                      </div>
                    )} */}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        {item.product?.name ?? "Product Deleted"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Size: {item.size} - ${item.price}
                      </p>
                      <p className="text-green-600 dark:text-green-400 font-semibold mt-1">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Select
                  value={activeOrder.status}
                  onValueChange={(val) =>
                    handleStatusChange(activeOrder._id, val)
                  }
                  disabled={updatingId === activeOrder._id}
                >
                  <SelectTrigger className="w-full sm:w-1/2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="served">Served</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="w-full sm:w-1/2 bg-red-500 text-white hover:bg-red-600 rounded-lg font-medium transition-all duration-300"
                  onClick={() => deleteOrder(activeOrder._id)}
                >
                  Delete Order
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersDashboard;
