import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReceiptSettings {
  businessName?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  receiptFooter?: string;
  currency?: string;
  taxRate?: number;
  serviceCharge?: number;
}

export const extractReceiptData = (
  order: any,
  settings: ReceiptSettings,
  tables: any[] = []
) => {
  const actualOrder = order?.data ? order.data : order;

  const orderNumber = actualOrder.orderToken
    ? `#${actualOrder.orderToken}`
    : actualOrder.customOrderID
    ? `#${actualOrder.customOrderID}`
    : `#${actualOrder._id?.slice(-6) || "0000"}`;

  const dateObj = actualOrder.createdAt
    ? new Date(actualOrder.createdAt)
    : new Date();
  const dateStr = dateObj.toLocaleDateString("en-GB");
  const timeStr = dateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const orderType =
    actualOrder.orderType === "takeaway" ? "Takeaway 🛍️" : "Dine-In 🍽️";

  let tableName = "N/A";
  if (actualOrder.orderType === "takeaway") {
    tableName = "Takeaway";
  } else if (actualOrder.table?.name) {
    tableName = actualOrder.table.name;
  } else if (typeof actualOrder.table === "string") {
    const found = tables.find((t) => t._id === actualOrder.table);
    tableName = found ? found.name : "Dine-In";
  } else {
    tableName = "Dine-In";
  }

  const customerName =
    actualOrder.customer?.name ||
    (typeof actualOrder.customer === "string" ? actualOrder.customer : null);
  const cashierName = actualOrder.cashier?.name || "Staff";

  const rawItems = actualOrder.items || [];
  const items = rawItems.map((item: any) => {
    const name = item.name || item.product?.name || "Menu Item";
    const quantity = Number(item.quantity) || 1;
    const size = item.size || "Regular";
    const basePrice = Number(item.price) || 0;
    const modPrice =
      Number(item.modifiersPrice) ||
      (item.selectedModifiers || []).reduce(
        (sum: number, m: any) => sum + (Number(m.price) || 0),
        0
      );
    const unitTotal = basePrice + modPrice;
    const lineTotal = unitTotal * quantity;
    const modifiers = item.selectedModifiers || [];
    const note = item.itemNote || "";

    return {
      name,
      quantity,
      size,
      basePrice,
      modPrice,
      unitTotal,
      lineTotal,
      modifiers,
      note,
    };
  });

  const subtotal =
    Number(actualOrder.subtotal) ||
    items.reduce((sum: number, it: any) => sum + it.lineTotal, 0);
  const discountPercent = Number(actualOrder.discountPercent) || 0;
  const discountAmount =
    Number(actualOrder.discountAmount) ||
    (discountPercent > 0 ? (subtotal * discountPercent) / 100 : 0);

  const loyaltyDiscount = Number(actualOrder.loyaltyDiscount) || 0;
  const taxRate =
    Number(actualOrder.taxRate) || Number(settings.taxRate) || 0;
  const taxAmount = Number(actualOrder.taxAmount) || 0;
  const serviceChargeRate =
    Number(actualOrder.serviceChargeRate) ||
    Number(settings.serviceCharge) ||
    0;
  const serviceChargeAmount = Number(actualOrder.serviceChargeAmount) || 0;

  const totalPrice =
    Number(actualOrder.totalPrice) ||
    Math.max(
      0,
      subtotal -
        discountAmount -
        loyaltyDiscount +
        taxAmount +
        serviceChargeAmount
    );

  const amountPaid = Number(actualOrder.amountPaid) || totalPrice;
  const changeDue =
    Number(actualOrder.changeDue) || Math.max(0, amountPaid - totalPrice);
  const paymentMethod = actualOrder.paymentMethod || "Cash";
  const payments = Array.isArray(actualOrder.payments)
    ? actualOrder.payments
    : [];
  const status = actualOrder.status || "pending";

  const currency = settings.currency === "USD" ? "$" : "৳";

  return {
    orderNumber,
    dateStr,
    timeStr,
    orderType,
    tableName,
    customerName,
    cashierName,
    items,
    subtotal,
    discountPercent,
    discountAmount,
    loyaltyDiscount,
    taxRate,
    taxAmount,
    serviceChargeRate,
    serviceChargeAmount,
    totalPrice,
    amountPaid,
    changeDue,
    paymentMethod,
    payments,
    status,
    currency,
    businessName: settings.businessName || "BornoCafe",
    address: settings.address || "Specialty Coffee House",
    phone: settings.phone || "+880 1700-000000",
    website: settings.website || "https://bornocafe.vercel.app",
    receiptFooter:
      settings.receiptFooter ||
      "Thank you for your visit! Enjoy your coffee.",
  };
};

export const generateReceiptHTML = (
  order: any,
  settings: ReceiptSettings,
  tables: any[] = []
) => {
  const d = extractReceiptData(order, settings, tables);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Receipt ${d.orderNumber} - ${d.businessName}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    @media print {
      html, body {
        width: 80mm;
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: 'Courier New', Courier, monospace, -apple-system, sans-serif;
      font-size: 12px;
      line-height: 1.35;
      color: #000000;
      background: #ffffff;
      width: 78mm;
      max-width: 80mm;
      margin: 0 auto;
      padding: 12px 10px;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .bold { font-weight: bold; }
    .uppercase { text-transform: uppercase; }
    
    .brand-title {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .brand-sub {
      font-size: 11px;
      letter-spacing: 1px;
      margin: 2px 0 0 0;
      text-transform: uppercase;
    }
    .brand-info {
      font-size: 10px;
      color: #333333;
      margin: 3px 0;
    }
    
    .divider {
      border-top: 1px dashed #000000;
      margin: 7px 0;
    }
    .divider-double {
      border-top: 2px solid #000000;
      margin: 8px 0;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      margin: 2px 0;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 4px 0;
    }
    .items-table th {
      font-size: 10px;
      border-bottom: 1px dashed #000000;
      padding: 3px 0;
      text-transform: uppercase;
    }
    .items-table td {
      padding: 3px 0;
      vertical-align: top;
    }
    
    .item-name {
      font-size: 12px;
      font-weight: bold;
    }
    .item-sub {
      font-size: 10px;
      color: #444444;
      padding-left: 6px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      margin: 2px 0;
    }
    .grand-total {
      display: flex;
      justify-content: space-between;
      font-size: 15px;
      font-weight: 900;
      margin: 6px 0;
      padding: 4px 0;
      border-top: 1px solid #000000;
      border-bottom: 1px solid #000000;
    }

    .tender-badge {
      font-size: 11px;
      margin: 3px 0;
    }

    .footer-msg {
      margin-top: 12px;
      text-align: center;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="text-center">
    <h1 class="brand-title">${d.businessName}</h1>
    <p class="brand-sub">Specialty Coffee & Kitchen</p>
    <p class="brand-info">${d.address}</p>
    <p class="brand-info">Tel: ${d.phone}</p>
  </div>

  <div class="divider"></div>

  <!-- Order Meta Information -->
  <div class="meta-row">
    <span class="bold">ORDER: ${d.orderNumber}</span>
    <span>${d.orderType}</span>
  </div>
  <div class="meta-row">
    <span>Date: ${d.dateStr}</span>
    <span>Time: ${d.timeStr}</span>
  </div>
  <div class="meta-row">
    <span>Table: <span class="bold">${d.tableName}</span></span>
    <span>Cashier: ${d.cashierName}</span>
  </div>
  ${
    d.customerName
      ? `<div class="meta-row"><span>Customer: <span class="bold">${d.customerName}</span></span></div>`
      : ""
  }

  <div class="divider"></div>

  <!-- Items Table -->
  <table class="items-table">
    <thead>
      <tr>
        <th class="text-left" style="width: 55%;">ITEM</th>
        <th class="text-center" style="width: 15%;">QTY</th>
        <th class="text-right" style="width: 30%;">PRICE</th>
      </tr>
    </thead>
    <tbody>
      ${d.items
        .map(
          (item: any) => `
        <tr>
          <td class="text-left">
            <div class="item-name">${item.name}</div>
            ${
              item.size && item.size !== "Regular"
                ? `<div class="item-sub">• Size: ${item.size}</div>`
                : ""
            }
            ${item.modifiers
              .map((m: any) => `<div class="item-sub">+ ${m.name} (${d.currency}${m.price})</div>`)
              .join("")}
            ${item.note ? `<div class="item-sub"><em>"${item.note}"</em></div>` : ""}
          </td>
          <td class="text-center bold">${item.quantity}</td>
          <td class="text-right bold">${d.currency}${item.lineTotal.toFixed(2)}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="divider"></div>

  <!-- Financial Summary -->
  <div class="totals-row">
    <span>Subtotal</span>
    <span>${d.currency}${d.subtotal.toFixed(2)}</span>
  </div>

  ${
    d.discountAmount > 0
      ? `
    <div class="totals-row">
      <span>Discount (${d.discountPercent}%)</span>
      <span>-${d.currency}${d.discountAmount.toFixed(2)}</span>
    </div>
  `
      : ""
  }

  ${
    d.loyaltyDiscount > 0
      ? `
    <div class="totals-row">
      <span>Loyalty Points Discount</span>
      <span>-${d.currency}${d.loyaltyDiscount.toFixed(2)}</span>
    </div>
  `
      : ""
  }

  ${
    d.taxRate > 0
      ? `
    <div class="totals-row">
      <span>VAT / Tax (${d.taxRate}%)</span>
      <span>+${d.currency}${d.taxAmount.toFixed(2)}</span>
    </div>
  `
      : ""
  }

  ${
    d.serviceChargeRate > 0
      ? `
    <div class="totals-row">
      <span>Service Charge (${d.serviceChargeRate}%)</span>
      <span>+${d.currency}${d.serviceChargeAmount.toFixed(2)}</span>
    </div>
  `
      : ""
  }

  <!-- Grand Total -->
  <div class="grand-total">
    <span>TOTAL PAID</span>
    <span>${d.currency}${d.totalPrice.toFixed(2)}</span>
  </div>

  <!-- Payment Details -->
  <div class="meta-row tender-badge">
    <span>Payment Tender:</span>
    <span class="bold uppercase">${d.paymentMethod}</span>
  </div>

  ${
    d.payments.length > 1
      ? d.payments
          .map(
            (p: any) => `
        <div class="meta-row" style="font-size: 10px; color: #444; padding-left: 6px;">
          <span>• ${p.method?.toUpperCase()}</span>
          <span>${d.currency}${Number(p.amount || 0).toFixed(2)}</span>
        </div>
      `
          )
          .join("")
      : ""
  }

  ${
    d.changeDue > 0
      ? `
    <div class="meta-row">
      <span>Change Given:</span>
      <span class="bold">${d.currency}${d.changeDue.toFixed(2)}</span>
    </div>
  `
      : ""
  }

  <div class="divider"></div>

  <!-- Kitchen Status -->
  <div class="meta-row">
    <span>Kitchen Ticket Status:</span>
    <span class="bold uppercase">${d.status}</span>
  </div>

  <div class="divider"></div>

  <!-- Footer Message -->
  <div class="footer-msg">
    <p class="bold">${d.receiptFooter}</p>
    <p style="margin-top: 4px; color: #555;">${d.website}</p>
    <p style="margin-top: 4px; font-size: 9px; color: #777;">Powered by BornoCafe POS</p>
  </div>
</body>
</html>
  `;
};

/**
 * Enterprise In-Page Iframe Printing (Bypasses popup blockers, instant print)
 */
export const printReceipt = (
  order: any,
  settings: ReceiptSettings,
  tables: any[] = []
): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      if (!order) {
        resolve(false);
        return;
      }

      const html = generateReceiptHTML(order, settings, tables);

      let iframe = document.getElementById(
        "cafe-sync-receipt-iframe"
      ) as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = "cafe-sync-receipt-iframe";
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0px";
        iframe.style.height = "0px";
        iframe.style.border = "none";
        iframe.style.zIndex = "-9999";
        document.body.appendChild(iframe);
      }

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!doc) {
        const win = window.open("", "_blank", "width=400,height=600");
        if (win) {
          win.document.write(html);
          win.document.close();
          win.focus();
          setTimeout(() => {
            win.print();
            win.close();
          }, 300);
          resolve(true);
        } else {
          resolve(false);
        }
        return;
      }

      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          resolve(true);
        } catch (printErr) {
          console.error("Iframe print error:", printErr);
          resolve(false);
        }
      }, 250);
    } catch (err) {
      console.error("Print receipt exception:", err);
      resolve(false);
    }
  });
};

/**
 * Download Styled Thermal Receipt as PDF via jsPDF
 */
export const downloadReceiptPDF = (
  order: any,
  settings: ReceiptSettings,
  tables: any[] = []
) => {
  const d = extractReceiptData(order, settings, tables);

  // 80mm thermal width format (80mm x 200mm)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 200],
  });

  let y = 8;

  // Header
  doc.setFont("courier", "bold");
  doc.setFontSize(14);
  doc.text(d.businessName, 40, y, { align: "center" });

  y += 5;
  doc.setFontSize(8);
  doc.setFont("courier", "normal");
  doc.text("Specialty Coffee & Kitchen", 40, y, { align: "center" });

  y += 4;
  doc.text(d.address, 40, y, { align: "center" });
  y += 3.5;
  doc.text(`Tel: ${d.phone}`, 40, y, { align: "center" });

  y += 3;
  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, y, 75, y);

  // Meta details
  y += 4;
  doc.setFont("courier", "bold");
  doc.text(`ORDER: ${d.orderNumber}`, 5, y);
  doc.text(d.orderType, 75, y, { align: "right" });

  y += 3.5;
  doc.setFont("courier", "normal");
  doc.text(`Date: ${d.dateStr}`, 5, y);
  doc.text(`Time: ${d.timeStr}`, 75, y, { align: "right" });

  y += 3.5;
  doc.text(`Table: ${d.tableName}`, 5, y);
  doc.text(`Cashier: ${d.cashierName}`, 75, y, { align: "right" });

  if (d.customerName) {
    y += 3.5;
    doc.text(`Customer: ${d.customerName}`, 5, y);
  }

  y += 2.5;
  doc.line(5, y, 75, y);

  // Items table
  const tableData = d.items.map((it: any) => [
    `${it.name}${it.size && it.size !== "Regular" ? ` (${it.size})` : ""}`,
    it.quantity.toString(),
    `${d.currency}${it.lineTotal.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: y + 2,
    head: [["ITEM", "QTY", "PRICE"]],
    body: tableData,
    theme: "plain",
    styles: {
      font: "courier",
      fontSize: 8,
      cellPadding: 1,
    },
    headStyles: {
      fontStyle: "bold",
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 42 },
      1: { cellWidth: 10, halign: "center" },
      2: { cellWidth: 18, halign: "right" },
    },
    margin: { left: 5, right: 5 },
  });

  y = (doc as any).lastAutoTable.finalY + 2;
  doc.line(5, y, 75, y);

  // Totals
  y += 4;
  doc.text("Subtotal", 5, y);
  doc.text(`${d.currency}${d.subtotal.toFixed(2)}`, 75, y, { align: "right" });

  if (d.discountAmount > 0) {
    y += 3.5;
    doc.text(`Discount (${d.discountPercent}%)`, 5, y);
    doc.text(`-${d.currency}${d.discountAmount.toFixed(2)}`, 75, y, {
      align: "right",
    });
  }

  if (d.taxRate > 0) {
    y += 3.5;
    doc.text(`VAT / Tax (${d.taxRate}%)`, 5, y);
    doc.text(`+${d.currency}${d.taxAmount.toFixed(2)}`, 75, y, {
      align: "right",
    });
  }

  y += 4;
  doc.setFont("courier", "bold");
  doc.setFontSize(11);
  doc.text("TOTAL PAID", 5, y);
  doc.text(`${d.currency}${d.totalPrice.toFixed(2)}`, 75, y, { align: "right" });

  y += 4;
  doc.setFontSize(8);
  doc.setFont("courier", "normal");
  doc.text("Payment Tender:", 5, y);
  doc.text(d.paymentMethod.toUpperCase(), 75, y, { align: "right" });

  y += 4;
  doc.line(5, y, 75, y);

  // Footer
  y += 5;
  doc.setFontSize(7.5);
  doc.text(d.receiptFooter, 40, y, { align: "center" });
  y += 3.5;
  doc.text(d.website, 40, y, { align: "center" });

  doc.save(`Receipt_${d.orderNumber.replace("#", "")}.pdf`);
};
