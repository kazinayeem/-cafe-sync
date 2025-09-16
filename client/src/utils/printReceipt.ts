import type { Table } from "@/types/User";

interface Settings {
  businessName: string;
  address: string;
  phone: string;
  website: string;
  receiptFooter: string;
  taxRate: number;
}

export const printReceipt = (
  data: any,
  items: any[],
  discountPercent: number,
  tables: Table[],
  selectedTable: string | null,
  totalPrice: number,
  settings: Settings
) => {
  const discountAmount = (totalPrice * discountPercent) / 100;
  const tax = (totalPrice - discountAmount) * (settings.taxRate / 100);
  const finalTotal = totalPrice - discountAmount + tax;

  const receiptWindow = window.open(
    "",
    `PrintReceipt-${data?.data?._id || "n"}`,
    "width=800,height=600"
  );
  if (!receiptWindow) return;

  const now = new Date();
  const formattedDate = now.toLocaleString();

  receiptWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body { 
            font-family: monospace, sans-serif; 
            font-size: 12px; 
            width: 260px; 
            margin: 0; 
            padding: 10px; 
            color: #000;
          }
          h2, h3 { 
            text-align: center; 
            margin: 0; 
            font-weight: bold;
          }
          h2 { font-size: 16px; margin-bottom: 2px; }
          h3 { font-size: 12px; font-weight: normal; }
          .line { border-bottom: 1px dashed #000; margin: 6px 0; }
          .row { display: flex; justify-content: space-between; margin: 2px 0; }
          .total { font-weight: bold; font-size: 14px; margin-top: 5px; }
          .small { font-size: 10px; color: #444; margin: 2px 0; }
          .footer { margin-top: 10px; text-align: center; font-size: 10px; color: #666; }
        </style>
      </head>
      <body>
        <h2>${settings.businessName}</h2>
        <h3>${settings.address}</h3>
        <p class="small" style="text-align:center;">Tel: ${settings.phone}</p>
        <div class="line"></div>

        <p class="small">Order ID: ${data?.data?._id || "N/A"}</p>
        <p class="small">Date: ${formattedDate}</p>
        ${
          selectedTable && tables
            ? `<p class="small">Table: ${
                tables.find((t) => t._id === selectedTable)?.name
              }</p>`
            : ""
        }

        <div class="line"></div>

        ${items
          .map(
            (item) =>
              `<div class="row"><span>${item.name} x${item.quantity}</span><span>${(
                item.price * item.quantity
              ).toFixed(2)}</span></div>`
          )
          .join("")}

        <div class="line"></div>

        <div class="row"><span>Subtotal</span><span>${totalPrice.toFixed(
          2
        )}</span></div>
        <div class="row"><span>Discount (${discountPercent}%)</span><span>- ${discountAmount.toFixed(
    2
  )}</span></div>
        <div class="row"><span>Tax (${settings.taxRate}%)</span><span>${tax.toFixed(2)}</span></div>
        <div class="row total"><span>Total</span><span>${finalTotal.toFixed(
          2
        )}</span></div>

        <div class="line"></div>
        <p style="text-align:center; margin: 6px 0;">✅ Thank you for your order!</p>

        <div class="footer">
          <p>${settings.receiptFooter}</p>
          <p><a href="${settings.website}" target="_blank">${settings.website}</a></p>
        </div>
      </body>
    </html>
  `);

  receiptWindow.document.close();
  receiptWindow.focus();
  receiptWindow.print();
  setTimeout(() => receiptWindow.close(), 800);
};
