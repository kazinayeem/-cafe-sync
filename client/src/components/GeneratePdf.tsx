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
  table?: { tableNumber: string }; // <-- Corrected type definition
  paymentMethod?: string;
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

const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (price?: number | null) => {
  const safe = typeof price === "number" && !isNaN(price) ? price : 0;
  return `${safe.toFixed(2)}`;
};

const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const generatePDF = (
  filter: string,
  startDate: string,
  endDate: string,
  status: string,
  summary: Summary,
  orders: Order[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 14;
  let y = margin;

  // --- Header ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("CAFE SYNC", pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(14);
  doc.text("SALES REPORT", pageWidth / 2, y, { align: "center" });
  y += 12;

  // --- Generation Info ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  y += 6;

  // --- Report Period ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("REPORT PERIOD", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.text(`Filter: ${capitalizeFirst(filter)}`, margin, y);
  y += 5;

  if (filter === "custom") {
    doc.text(`From: ${formatDate(startDate)}`, margin, y);
    y += 5;
    doc.text(`To: ${formatDate(endDate)}`, margin, y);
    y += 5;
  }

  doc.text(
    `Status: ${status === "all" ? "All Statuses" : capitalizeFirst(status)}`,
    margin,
    y
  );
  y += 10;

  // --- Summary Section ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("SUMMARY", margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Total Orders: ${summary.totalOrders}`, margin, y);
  y += 6;
  doc.text(`Total Revenue: ${formatPrice(summary.totalSales)}`, margin, y);
  y += 15;

  // --- Orders Details ---
  if (orders.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("ORDER DETAILS", margin, y);
    y += 10;

    orders.forEach((order, index) => {
      // Check if we need a new page
      if (y > doc.internal.pageSize.height - 60) {
        doc.addPage();
        y = margin;
      }

      // Order Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`Order #${index + 1}`, margin, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`ID: ${order._id}`, margin, y);

      // Changed this line to check for tableNumber
      if (order.table?.tableNumber) {
        doc.text(`Table: ${order.table.tableNumber}`, margin + 60, y);
      }

      if (order.status) {
        doc.text(`Status: ${capitalizeFirst(order.status)}`, margin + 120, y);
      }

      y += 5;
      doc.text(`Date: ${formatDateTime(order.createdAt)}`, margin, y);

      if (order.paymentMethod) {
        doc.text(
          `Payment: ${capitalizeFirst(order.paymentMethod)}`,
          margin + 60,
          y
        );
      }

      y += 8;

      // Order Items Table
      const tableBody = order.items.map((item) => [
        `${item.product.name}${item.size ? ` (${item.size})` : ""}`,
        formatPrice(item.price),
        item.quantity.toString(),
        formatPrice(item.price * item.quantity),
      ]);

      autoTable(doc, {
        startY: y,
        head: [["Item", "Price", "Qty", "Total"]],
        body: tableBody,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 2,
          lineWidth: 0.1,
          fillColor: [255, 255, 255],
          textColor: 0,
        },
        headStyles: {
          fontStyle: "bold",
          lineWidth: 0.2,
          fillColor: [255, 255, 255],
          textColor: 0,
        },
        alternateRowStyles: {
          fillColor: [255, 255, 255],
        },
        margin: { left: margin, right: margin },
        tableWidth: "auto",
      });

      y = (doc as any).lastAutoTable.finalY + 5;

      // Order Total
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(
        `Order Total: ${formatPrice(order.totalPrice)}`,
        pageWidth - margin,
        y,
        { align: "right" }
      );
      y += 10;

      // Separator line between orders
      if (index < orders.length - 1) {
        doc.setLineWidth(0.1);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
      }
    });
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.text("No orders found for the selected criteria.", margin, y);
  }

  // --- Footer ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);

    // Centered page number
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );

    doc.setFontSize(7);
    doc.text(
      "www.kazinayee.site | made by Nayeem Soft",
      margin,
      doc.internal.pageSize.height - 10
    );
  }

  // --- Save PDF ---
  const fileName = `cafe-sync-sales-report-${new Date()
    .toISOString()
    .slice(0, 10)}.pdf`;
  doc.save(fileName);
};
