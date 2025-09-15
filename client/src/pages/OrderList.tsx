import { useEffect, useRef, useState, type RefObject } from "react";
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
import { Loader, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import type { Order, OrdersResponse } from "@/types/User";

const OrdersListExpandable = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const ref: RefObject<HTMLDivElement | null> = useRef(null);
  const isInitialLoad = useRef(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [status, setStatus] = useState<"pending" | "preparing" | "served" | "cancelled" | "">("");
  const today = new Date();
  const localToday = today.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
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
    limit: 10,
    status: "",
    startDate: start,
    endDate: end,
  });

  const { data: response, isLoading, isError, isFetching } = useGetOrdersQuery(
    {
      page: query.page,
      limit: query.limit,
      status: query.status || undefined,
      startDate: query.startDate || undefined,
      endDate: query.endDate || undefined,
      orderId: query.orderId,
    },
    { refetchOnMountOrArgChange: true }
  ) as { data?: OrdersResponse; isLoading: boolean; isError: boolean; isFetching: boolean };

  const [deleteOrder] = useDeleteOrderMutation();
  const [updateOrder] = useUpdateOrderMutation();

  const orders = response?.data ?? [];
  const totalPages = response?.pagination?.totalPages ?? 1;

  useEffect(() => {
    if (isInitialLoad.current && !isLoading && !isFetching && orders.length > 0) {
      setActiveOrder(orders[0]);
      isInitialLoad.current = false;
    }
  }, [orders, isLoading, isFetching]);

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

  useOutsideClick(ref as React.RefObject<HTMLDivElement>, () => setActiveOrder(null));

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <p className="text-red-500 text-center p-8">Error loading orders.</p>;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans p-4 sm:p-8">
      <h1 className="text-xl sm:text-2xl font-extrabold text-center text-gray-900 dark:text-gray-100 mb-8">
        Orders Dashboard 📈
      </h1>

      {/* Filters */}
      <div className="p-2">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Filter Orders
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Items per page */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Items per page
            </label>
            <Select value={String(limit)} onValueChange={(val) => setLimit(Number(val))}>
              <SelectTrigger>
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

          {/* Search Order ID */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Search Order ID
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter Order ID..."
              className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md p-2"
            />
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
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
              <SelectTrigger>
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

          {/* Start Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md p-2"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md p-2"
            />
          </div>
        </div>

        {/* Apply Filters Button */}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            onClick={handleSearch}
            disabled={isFetching}
            className="bg-purple-600 text-white hover:bg-purple-700 transition-all transform hover:scale-105"
          >
            {isFetching ? (
              <span className="flex items-center">
                <Loader className="animate-spin w-4 h-4 mr-2" /> Searching...
              </span>
            ) : (
              <span className="flex items-center">
                <Search className="w-4 h-4 mr-2" /> Apply Filters
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Orders List */}
      <div className="grid gap-6 mt-6">
        {orders.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">
            No orders found.
          </p>
        ) : (
          orders.map((order) => (
            <motion.div
              key={order._id}
              layout
              onClick={() => setActiveOrder(order)}
              className="cursor-pointer bg-white dark:bg-gray-800 shadow-xl rounded-xl p-4 sm:p-6 flex flex-col gap-4 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Order #{order._id.substring(0, 8)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                    Payment: {order.paymentMethod}
                  </p>
                </div>
                <p className="text-green-600 dark:text-green-400 text-lg font-bold">
                  ${order.totalPrice.toFixed(2)}
                </p>
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
              <Button onClick={() => goToPage(page - 1)} disabled={page === 1} className="h-10 w-10 rounded-full">
                Prev
              </Button>
            </PaginationPrevious>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <Button
                  onClick={() => goToPage(i + 1)}
                  className={cn(
                    "rounded-full h-10 w-10",
                    page === i + 1
                      ? "bg-purple-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {i + 1}
                </Button>
              </PaginationItem>
            ))}
            <PaginationNext>
              <Button onClick={() => goToPage(page + 1)} disabled={page === totalPages} className="h-10 w-10 rounded-full">
                Next
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
            className="fixed inset-0 bg-black/50 z-40 grid place-items-center p-4"
          >
            <motion.div
              ref={ref}
              layout
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full p-6 overflow-auto relative shadow-2xl"
            >
              <button
                onClick={() => setActiveOrder(null)}
                className="absolute top-4 right-4 rounded-full bg-gray-200 dark:bg-gray-800 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Order Details */}
              <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Order Details</h2>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">ID: {activeOrder._id}</p>

              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 border-b pb-4 border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Total: ${activeOrder.totalPrice.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Payment: {activeOrder.paymentMethod}</p>
                </div>
                {activeOrder?.table && (
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-400">Table: {activeOrder.table.name}</p>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        activeOrder.table.status === "occupied" ? "text-red-500" : "text-green-500"
                      )}
                    >
                      Status: {activeOrder.table.status}
                    </p>
                  </div>
                )}
              </div>

              {/* Items */}
              <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">Items</h3>
              <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2">
                {activeOrder.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 flex flex-col">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{item.product.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-300">
                        Size: {item.size} - ${item.price}
                      </p>
                      <p className="text-green-600 dark:text-green-400 font-bold mt-1">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status & Delete */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex-1">
                  <Select
                    value={activeOrder.status}
                    onValueChange={(val) => handleStatusChange(activeOrder._id, val)}
                    disabled={updatingId === activeOrder._id}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="served">Served</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 flex gap-3">
                  <Button className="w-full bg-red-500 text-white hover:bg-red-600" onClick={() => deleteOrder(activeOrder._id)}>
                    Delete Order
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersListExpandable;
