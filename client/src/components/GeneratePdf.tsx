import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface OrderItem {
  product: { name: string };
  size: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalPrice: number;
  createdAt: string;
  status?: string;
  table?: { name: string };
  paymentMethod?: string;
  customOrderID?: string;
}

interface Summary {
  totalOrders: number;
  totalSales: number;
}

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (dateStr?: string | null) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (price?: number | null) => {
  const safe = typeof price === "number" && !isNaN(price) ? price : 0;
  return `${safe.toFixed(2)}`;
};

const capitalizeFirst = (str: string) => {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
};

export const generatePDF = (
  filter: string,
  startDate: string,
  endDate: string,
  status: string,
  summary: Summary,
  orders: Order[],
) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let y = margin;

  // --- COVER PAGE (Professional Layout) ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("CAFE SYNC", pageWidth / 2, y, { align: "center" });
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text("Sales Report", pageWidth / 2, y, { align: "center" });
  y += 25;

  // Generated Date
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, y);
  y += 12;

  // Report Filters Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Report Filters", margin, y);
  y += 6;
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Filter: ${capitalizeFirst(filter)}`, margin, y);
  y += 6;
  if (filter === "custom") {
    doc.text(`From: ${formatDate(startDate)}`, margin, y);
    y += 6;
    doc.text(`To: ${formatDate(endDate)}`, margin, y);
    y += 6;
  }
  doc.text(
    `Status: ${status === "all" ? "All Statuses" : capitalizeFirst(status)}`,
    margin,
    y
  );
  y += 15;

  // Summary Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Summary", margin, y);
  y += 6;
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Total Orders: ${summary.totalOrders}`, margin, y);
  y += 6;
  doc.text(`Total Revenue: ${formatPrice(summary.totalSales)}`, margin, y);

  // Footer (cover page)
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.text(
    "Confidential Report – For internal use only",
    pageWidth / 2,
    doc.internal.pageSize.height - 15,
    { align: "center" }
  );

  doc.addPage();

  // --- ORDERS PAGE ---
  if (orders.length > 0) {
    const tableBody = orders.map((order, index) => {
      const itemsList = order.items
        .map(
          (item) =>
            `${item.product?.name || "N/A"} ${
              item.size ? `(${item.size})` : ""
            } x${item.quantity}`
        )
        .join("\n");

      return [
        index + 1,
        order.customOrderID || order._id,
        `${formatDate(order.createdAt)}\n${formatTime(order.createdAt)}`,
        order?.table?.name || "",
        capitalizeFirst(order.status || ""),
        capitalizeFirst(order.paymentMethod || ""),
        itemsList,
        formatPrice(order.totalPrice),
      ];
    });

    autoTable(doc, {
      head: [
        [
          "#",
          "Order ID",
          "Date & Time",
          "Table",
          "Status",
          "Payment",
          "Items",
          "Total",
        ],
      ],
      body: tableBody,
      theme: "grid",
      startY: margin,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: "middle",
      },
      headStyles: {
        fontStyle: "bold",
        fillColor: [240, 240, 240],
        textColor: 20,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 6 },
        1: { cellWidth: 28 },
        2: { cellWidth: 24 },
        3: { cellWidth: 18, halign: "center" },
        4: { cellWidth: 20, halign: "center" },
        5: { cellWidth: 20, halign: "center" },
        6: { cellWidth: 40 },
        7: { halign: "right", cellWidth: 25 },
      },
      margin: { left: margin, right: margin },
    });
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.text("No orders found for the selected criteria.", margin, margin + 10);
  }

  // --- GLOBAL FOOTER ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 8,
      { align: "center" }
    );

    doc.setFontSize(7);
    doc.text(
      "www.kazinayeem.site | made by NayeemSoft",
      margin,
      doc.internal.pageSize.height - 8
    );
  }

  doc.save(
    `cafe-sync-sales-report-${new Date().toISOString().slice(0, 10)}.pdf`
  );
};
