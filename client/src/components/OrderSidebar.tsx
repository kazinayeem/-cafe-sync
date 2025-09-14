import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { removeItem, updateQuantity, clearCart } from "@/store/cartSlice";
import { useCreateOrderMutation } from "@/services/orderApi";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getTables, updateTableStatus } from "@/services/tableService";
import { socket } from "@/utils/socket";

interface Table {
  _id: string;
  name: string;
  status: "free" | "occupied";
}

const OrderSidebar = () => {
  const dispatch = useDispatch();
  const { items, totalPrice } = useSelector((state: RootState) => state.cart);
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  // Fetch initial tables
  useEffect(() => {
    getTables().then((data) => setTables(data.tables));
  }, []);

  // Realtime table updates via socket
  useEffect(() => {
    socket.on("tableAdded", (newTable: Table) =>
      setTables((prev) => [...prev, newTable])
    );
    socket.on("tableUpdated", (updatedTable: Table) =>
      setTables((prev) =>
        prev.map((t) => (t._id === updatedTable._id ? updatedTable : t))
      )
    );
    socket.on("tableDeleted", (deletedId: string) =>
      setTables((prev) => prev.filter((t) => t._id !== deletedId))
    );
    socket.on("tableStatusUpdated", (data: { id: string; status: string }) =>
      setTables((prev) =>
        prev.map((t) =>
          t._id === data.id
            ? { ...t, status: data.status as "free" | "occupied" }
            : t
        )
      )
    );

    return () => {
      socket.off("tableAdded");
      socket.off("tableUpdated");
      socket.off("tableDeleted");
      socket.off("tableStatusUpdated");
    };
  }, []);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    try {
      const payload: any = {
        items: items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
          size: item.size,
          price: item.price,
        })),
        totalPrice,
        paymentMethod: "cash",
      };

      // Include table if selected
      if (selectedTable) payload.tableId = selectedTable;

      await createOrder(payload).unwrap();
      toast.success(
        `Order placed successfully!${
          selectedTable
            ? ` Table: ${tables.find((t) => t._id === selectedTable)?.name}`
            : ""
        }`
      );

      dispatch(clearCart());

      // Mark table as occupied if selected
      if (selectedTable) {
        // Update table status in DB
        await updateTableStatus(selectedTable, "occupied");

        // Update local tables state for UI
        setTables((prev) =>
          prev.map((t) =>
            t._id === selectedTable ? { ...t, status: "occupied" } : t
          )
        );

        // Reset selected table
        setSelectedTable(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order.");
    }
  };

  return (
    <div className="w-full mt-10 md:w-80 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl shadow-lg p-6 flex flex-col gap-6 transition-colors duration-300">
      <h2 className="text-xl font-bold border-b border-gray-300 dark:border-gray-600 pb-2">
        Cart / POS
      </h2>

      {/* Table selection */}
      <div>
        <label className="text-sm font-medium mb-1 block">
          Select Table (optional)
        </label>
        <Select
          value={selectedTable ?? ""}
          onValueChange={(val) => setSelectedTable(val || null)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select table" />
          </SelectTrigger>
          <SelectContent>
            {tables.map((t) => (
              <SelectItem
                key={t._id}
                value={t._id}
                disabled={t.status === "occupied"}
              >
                {t.name} {t.status === "occupied" ? "(Occupied)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Products you add will appear here.
        </p>
      ) : (
        <>
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-3 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col">
                <h3 className="font-semibold text-sm sm:text-base line-clamp-1">
                  {item.name}
                </h3>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-300">
                  Size: {item.size}
                </span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  ${item.price}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    dispatch(
                      updateQuantity({
                        productId: item.productId,
                        size: item.size,
                        quantity: item.quantity - 1 > 0 ? item.quantity - 1 : 1,
                      })
                    )
                  }
                >
                  -
                </Button>
                <span className="w-5 text-center">{item.quantity}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    dispatch(
                      updateQuantity({
                        productId: item.productId,
                        size: item.size,
                        quantity: item.quantity + 1,
                      })
                    )
                  }
                >
                  +
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    dispatch(
                      removeItem({ productId: item.productId, size: item.size })
                    )
                  }
                >
                  ×
                </Button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center mt-4 border-t border-gray-300 dark:border-gray-600 pt-3 font-bold text-lg">
            <span>Total</span>
            <span>${totalPrice}</span>
          </div>

          <Button
            className="w-full bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white font-semibold"
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? "Placing Order..." : "Checkout"}
          </Button>
        </>
      )}
    </div>
  );
};

export default OrderSidebar;
