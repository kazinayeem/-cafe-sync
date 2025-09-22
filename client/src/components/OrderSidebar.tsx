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
import { useGetSettingsQuery } from "@/services/SettingsApi";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DiscountDialog } from "./SetDiscount";
import { printReceipt } from "@/utils/printReceipt";
import Swal from "sweetalert2";

interface Table {
  _id: string;
  name: string;
  status: "free" | "occupied";
}
interface OrderSidebarProps {
  disabled?: boolean;
}
const OrderSidebar: React.FC<OrderSidebarProps> = ({ disabled = false }) => {
  const dispatch = useDispatch();
  const { items, totalPrice } = useSelector((state: RootState) => state.cart);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [discountDialog, setDiscountDialog] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data: settingsData } = useGetSettingsQuery({});
  const taxRate = settingsData?.data?.taxRate ?? 0;
  const defaultDiscount = settingsData?.data?.discountRate ?? 0;
  const enableDiscountInput = settingsData?.data?.enableDiscountInput;
  useEffect(() => {
    setDiscountPercent(defaultDiscount);
  }, [defaultDiscount]);

  useEffect(() => {
    getTables().then((data) => setTables(data.tables));
  }, []);

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

  const confirmCheckout = async (shouldPrint: boolean) => {
    try {
      Swal.fire({
        title: "Processing...",
        text: "Please wait while we place your order",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const itemsToPrint = [...items]; // copy items before clearing

      // Open print window early to avoid popup blocking
      let receiptWindow: Window | null = null;
      if (shouldPrint) {
        receiptWindow = window.open("", "PrintReceipt", "width=800,height=600");
      }

      const payload: any = {
        items: items.map((i) => ({
          product: i.productId,
          quantity: i.quantity,
          size: i.size,
          price: i.price,
        })),
        totalPrice,
        discountPercent: discountPercent,
        taxRate: taxRate,
        paymentMethod: "cash",
        tableId: selectedTable || undefined,
      };

      const data = await createOrder(payload).unwrap();
      Swal.close();

      Swal.fire({
        icon: "success",
        title: "Order placed!",
        timer: 1200,
        showConfirmButton: false,
      });

      setConfirmOpen(false);

      dispatch(clearCart());
      setDiscountPercent(defaultDiscount);
      if (selectedTable) {
        await updateTableStatus(selectedTable, "occupied");
        setSelectedTable(null);
      }

      // Fill and print the receipt
      if (shouldPrint && settingsData?.data && receiptWindow) {
        printReceipt(
          data,
          itemsToPrint,
          discountPercent,
          tables,
          selectedTable,
          totalPrice,
          {
            businessName: settingsData.data.businessName,
            address: settingsData.data.address,
            phone: settingsData.data.phone,
            website: settingsData.data.website,
            receiptFooter: settingsData.data.receiptFooter,
            taxRate: settingsData.data.taxRate,
          },
          receiptWindow
        );
      }
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Failed to place order",
        text: "Something went wrong. Try again.",
      });
    }
  };

  // Clear cart
  const handleClearCart = () => {
    dispatch(clearCart());
    toast.success("Cart cleared!");
  };

  // Financials
  const discountAmount = (totalPrice * discountPercent) / 100;
  const tax = (totalPrice - discountAmount) * (taxRate / 100);
  const finalTotal = totalPrice - discountAmount + tax;

  return (
    <div className="w-full md:w-96 shadow-lg mt-6 dark:bg-gray-900 bg-white text-gray-900 dark:text-gray-100 p-4 sm:p-5 md:p-6 flex flex-col rounded-xl">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-base sm:text-lg md:text-xl font-bold">Order</h2>
        <Button variant="ghost" size="sm" onClick={handleClearCart}>
          Clear All
        </Button>
      </div>

      {/* Discount dialog */}
      <DiscountDialog
        open={discountDialog}
        onClose={() => setDiscountDialog(false)}
        onApply={(d) => {
          if (d >= 0 && d <= 100) {
            setDiscountPercent(d);
            toast.success(`Discount ${d}% applied`);
          } else {
            toast.error("Please enter a valid discount (0–100%)");
          }
        }}
      />

      {/* Items */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">
            Products you add will appear here.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={item.imageUrl ?? "/placeholder-coffee.png"}
                alt={item.name}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-sm line-clamp-1">
                  {item.name}
                </h3>
                <span className="text-xs text-gray-500">{item.price}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6 text-xs"
                  onClick={() =>
                    item.quantity > 1
                      ? dispatch(
                          updateQuantity({
                            productId: item.productId,
                            size: item.size,
                            quantity: item.quantity - 1,
                          })
                        )
                      : dispatch(
                          removeItem({
                            productId: item.productId,
                            size: item.size,
                          })
                        )
                  }
                >
                  -
                </Button>
                <span className="w-5 text-center text-xs font-medium">
                  {item.quantity}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6"
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
                  size="icon"
                  variant="destructive"
                  className="h-6 w-6 text-xs"
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
          ))
        )}
      </div>

      {/* Table select */}
      <div className="mb-4">
        <Select
          disabled={disabled}
          value={selectedTable ?? ""}
          onValueChange={(val) => setSelectedTable(val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Assign to Table (optional)" />
          </SelectTrigger>
          <SelectContent>
            {tables.map((table) => (
              <SelectItem
                key={table._id}
                value={table._id}
                disabled={table.status === "occupied"}
              >
                {table.name} ({table.status})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Discount */}
      <div className="mb-4 flex justify-between items-center">
        <span className="text-sm">Discount: {discountPercent}%</span>

        <Button
          disabled={!enableDiscountInput || disabled}
          onClick={() => setDiscountDialog(true)}
        >
          Add Discount
        </Button>
      </div>

      {/* Financials */}
      <div className="mt-auto text-sm space-y-1">
        <div className="flex justify-between text-gray-700 dark:text-gray-300">
          <span>Subtotal</span>
          <span>{totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount ({discountPercent}%)</span>
          <span>- {discountAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({taxRate}%)</span>
          <span>{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mt-3 border-t pt-2 font-bold text-lg text-gray-900 dark:text-white">
          <span>Total</span>
          <span>{finalTotal.toFixed(2)}</span>
        </div>
      </div>

      <Button
        className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors duration-200"
        onClick={() => setConfirmOpen(true)}
        disabled={isLoading || items.length === 0 || disabled}
      >
        Place Order
      </Button>

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Order</DialogTitle>
            <DialogDescription>
              Do you want to place this order and print receipt?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 text-white"
              onClick={() => confirmCheckout(false)}
            >
              Confirm
            </Button>

            <Button
              className="bg-green-600 text-white"
              onClick={() => confirmCheckout(true)}
            >
              Confirm + Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderSidebar;
