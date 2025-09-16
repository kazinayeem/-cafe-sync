import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { removeItem, updateQuantity, clearCart } from "@/store/cartSlice";
import { useCreateOrderMutation } from "@/services/orderApi";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
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

const TAX_RATE = 0;

const OrderSidebar = () => {
  const dispatch = useDispatch();
  const { items, totalPrice } = useSelector((state: RootState) => state.cart);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Load tables
  useEffect(() => {
    getTables().then((data) => setTables(data.tables));
  }, []);
  const printReceipt = (orderId?: string) => {
    // Open a new window for the receipt
    const receiptWindow = window.open(
      "",
      "PrintReceipt",
      "width=800,height=600"
    );
    if (!receiptWindow) return;

    const now = new Date();
    const formattedDate = now.toLocaleString();

    // Write HTML content to the new window
    receiptWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body { 
            font-family: monospace; 
            font-size: 12px; 
            width: 240px; /* Thermal printer-friendly width */
            margin: 0; 
            padding: 5px;
          }
          h2, h3 { text-align: center; margin: 0; }
          .line { border-bottom: 1px dashed #000; margin: 5px 0; }
          .row { display: flex; justify-content: space-between; }
          .total { font-weight: bold; font-size: 14px; margin-top: 5px; }
          .small { font-size: 10px; color: #555; }
        </style>
      </head>
      <body>
        <!-- Cafe Info -->
        <h2>☕ Cafe Sync</h2>
        <h3>Mirpur, Dhaka, Bangladesh 1206</h3>
        <p class="small">Tel: 012-345-6789</p>
        <div class="line"></div>

        <!-- Order Info -->
        <p class="small">Order ID: ${orderId || "N/A"}</p>
        <p class="small">Date: ${formattedDate}</p>
        ${
          selectedTable
            ? `<p class="small">Table: ${
                tables.find((t) => t._id === selectedTable)?.name
              }</p>`
            : ""
        }
        <div class="line"></div>

        <!-- Items -->
        ${items
          .map(
            (item) =>
              `<div class="row"><span>${item.name} x${
                item.quantity
              }</span><span>${(item.price * item.quantity).toFixed(
                2
              )}</span></div>`
          )
          .join("")}

        <div class="line"></div>

        <!-- Totals -->
        <div class="row"><span>Subtotal</span><span>${totalPrice.toFixed(
          2
        )}</span></div>
        <div class="row"><span>Discount (${discountPercent}%)</span><span>- ${(
      (totalPrice * discountPercent) /
      100
    ).toFixed(2)}</span></div>
        <div class="row"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
        <div class="row total"><span>Total</span><span>${finalTotal.toFixed(
          2
        )}</span></div>
        <div class="line"></div>

        <!-- Footer -->
        <p style="text-align:center;">Thank you for your order!</p>
        <p style="text-align:center;" class="small">Wifi: some-wifi / PW: 123123</p>
        <p style="text-align:center;" class="small">Powered by NayeemSoft - kazinayee.site</p>
      </body>
    </html>
  `);

    // Finalize and print
    receiptWindow.document.close();
    receiptWindow.print();
  };

  // Socket sync
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

  // Discount prompt
  const handleDiscount = async () => {
    const { value: discount } = await Swal.fire({
      title: "Apply Discount",
      input: "number",
      inputAttributes: { min: "0", max: "100", step: "1" },
      inputValue: discountPercent,
      confirmButtonText: "Apply",
      showCancelButton: true,
      background: "#fff",
      color: "#000",
      confirmButtonColor: "#16a34a",
    });

    if (discount !== undefined) {
      const num = Number(discount);
      if (num >= 0 && num <= 100) {
        setDiscountPercent(num);
        toast.success(`Discount ${num}% applied`);
      } else {
        toast.error("Please enter a valid discount (0–100%)");
      }
    }
  };

  // Checkout with confirmation & print
  const handleCheckout = async () => {
    if (items.length === 0) return;

    const result = await Swal.fire({
      title: "Place Order",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Confirm Order",
      denyButtonText: "Confirm + Print Receipt",
      cancelButtonText: "Cancel",
      icon: "question",
    });

    if (result.isDismissed) return;

    const shouldPrint = result.isDenied;

    try {
      // Place order API call
      const payload: any = {
        items: items.map((i) => ({
          product: i.productId,
          quantity: i.quantity,
          size: i.size,
          price: i.price,
        })),
        totalPrice,
        discountPercent,
        paymentMethod: "cash",
        tableId: selectedTable || undefined,
      };

      const data = await createOrder(payload).unwrap();

      toast.success("Order placed successfully!");

      if (shouldPrint && data) printReceipt(data?.data?._id);

      dispatch(clearCart());
      setDiscountPercent(0);
      if (selectedTable) {
        await updateTableStatus(selectedTable, "occupied");
        setSelectedTable(null);
      }
    } catch (err) {
      toast.error("Failed to place order.");
    }
  };

  // Clear cart
  const handleClearCart = () => {
    dispatch(clearCart());
    toast.success("Cart cleared!");
  };

  const discountAmount = (totalPrice * discountPercent) / 100;
  const tax = (totalPrice - discountAmount) * TAX_RATE;
  const finalTotal = totalPrice - discountAmount + tax;

  return (
    <div className="w-full md:w-96 shadow-lg mt-6 dark:bg-gray-900 bg-white text-gray-900 dark:text-gray-100 p-4 md:p-6 flex flex-col rounded-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        <h2 className="text-lg md:text-xl font-bold">Order</h2>
        <Button variant="ghost" size="sm" onClick={handleClearCart}>
          Clear All
        </Button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Products you add will appear here.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 shadow-sm"
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
                <span className="text-xs text-gray-500 dark:text-gray-300">
                  {item.price}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6"
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
                <span className="w-5 text-center text-xs md:text-sm">
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
                  className="h-6 w-6"
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

      {/* Table Select */}
      <div className="mb-4">
        <Select
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
          variant="outline"
          size="sm"
          className="dark:border-gray-600"
          onClick={handleDiscount}
        >
          Apply Discount
        </Button>
      </div>

      {/* Financials */}
      <div className="mt-auto text-sm space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount ({discountPercent}%)</span>
          <span>- {discountAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mt-3 border-t pt-2 font-bold text-lg">
          <span>Total</span>
          <span>{finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout */}
      <Button
        className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white font-semibold"
        onClick={handleCheckout}
        disabled={isLoading || items.length === 0}
      >
        {isLoading ? "Placing Order..." : "Place Order"}
      </Button>
    </div>
  );
};

export default OrderSidebar;
