import { useState } from "react";
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
import { RefreshCw, Loader } from "lucide-react";

interface IOrderItem {
  product: {
    _id: string;
    name: string;
    imageUrl: string;
    sizes: Record<string, number>;
    category: string;
    available: boolean;
    description?: string;
  };
  quantity: number;
  _id: string;
}

interface ITable {
  _id: string;
  name: string;
  status: "free" | "occupied";
}

interface IOrder {
  _id: string;
  items: IOrderItem[];
  totalPrice: number;
  status: "pending" | "preparing" | "served" | "cancelled";
  paymentMethod: "cash" | "card" | "online";
  table?: ITable;
  createdAt: string;
  updatedAt: string;
}

const OrdersList = () => {
  const {
    data: response,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetOrdersQuery({});
  const [deleteOrder] = useDeleteOrderMutation();
  const [updateOrder] = useUpdateOrderMutation();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const orders: IOrder[] = response?.data ?? [];

  const handleStatusChange = async (
    orderId: string,
    status: IOrder["status"]
  ) => {
    setUpdatingId(orderId);
    try {
      await updateOrder({ id: orderId, data: { status } }).unwrap();
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading)
    return (
      <p className="text-gray-500 dark:text-gray-300">Loading orders...</p>
    );
  if (isError) return <p className="text-red-500">Error loading orders.</p>;

  return (
    <div className="flex flex-col gap-6 w-full md:w-3/4 mx-auto p-4">
      {/* Refresh Button */}
      <Button
        size="sm"
        variant="outline"
        className="flex items-center gap-2 mb-2"
        onClick={() => refetch()}
        disabled={isFetching}
      >
        {isFetching ? (
          <Loader className="animate-spin w-4 h-4" />
        ) : (
          <RefreshCw />
        )}
        {isFetching ? "Refreshing..." : "Refresh Orders"}
      </Button>

      {orders.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center">
          No orders available.
        </p>
      )}

      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex flex-col gap-4"
        >
          {order?.table && (
            <p>
              Table: {order?.table.name} ({order?.table?.status})
            </p>
          )}
          {/* Order header */}
          <div className="flex justify-between items-center flex-wrap gap-2">
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              Order #{order._id}
            </p>
            <p className="text-green-600 font-medium">${order.totalPrice}</p>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Payment: {order.paymentMethod}
            </p>
          </div>

          {/* Items list */}
          <div className="flex flex-col gap-2 border-t border-gray-200 dark:border-gray-600 pt-2">
            {order.items.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-2"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-12 h-12 object-cover rounded-md"
                />
                <div className="flex-1 flex flex-col">
                  <p className="font-semibold text-sm sm:text-base line-clamp-1">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">
                    Sizes:{" "}
                    {Object.entries(item.product.sizes)
                      .filter(([, price]) => price > 0)
                      .map(([size, price]) => `${size} $${price}`)
                      .join(", ")}
                  </p>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Quantity: {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Status update & delete */}
          <div className="flex flex-col md:flex-row gap-2 md:items-center mt-2">
            <Select
              value={order.status}
              onValueChange={(val) =>
                handleStatusChange(order._id, val as IOrder["status"])
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="served">Served</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteOrder(order._id)}
              disabled={updatingId === order._id}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersList;
