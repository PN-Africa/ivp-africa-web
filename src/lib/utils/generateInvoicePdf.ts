import jsPDF from "jspdf";
import type { RealPaymentRecord } from "@/lib/api/subscription";

export function generateInvoicePdf(payment: RealPaymentRecord, companyName: string) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(138, 56, 245); // #8A38F5
  doc.text("IVP Africa", 20, 25);

  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text("Talent Placement Platform", 20, 32);

  doc.setDrawColor(230, 230, 230);
  doc.line(20, 38, 190, 38);

  // Invoice title
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text("Invoice", 20, 52);

  // Invoice details
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const issueDate = new Date(payment.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  doc.text(`Billed to: ${companyName}`, 20, 65);
  doc.text(`Invoice date: ${issueDate}`, 20, 72);
  doc.text(`Invoice ID: ${payment.id.slice(0, 8).toUpperCase()}`, 20, 79);

  // Table header
  doc.setFillColor(245, 243, 250);
  doc.rect(20, 90, 170, 10, "F");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("DESCRIPTION", 25, 96);
  doc.text("STATUS", 130, 96);
  doc.text("AMOUNT", 165, 96);

  // Table row
  const amountNum = Number(payment.amount) || 0;
  const isSuccess = payment.status === "SUCCESS";

  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text(payment.plan?.name ?? "Subscription payment", 25, 108);
  doc.setTextColor(isSuccess ? 34 : 220, isSuccess ? 197 : 38, isSuccess ? 94 : 38);
  doc.text(isSuccess ? "Paid" : payment.status === "PENDING" ? "Pending" : "Failed", 130, 108);
  doc.setTextColor(20, 20, 20);
  doc.text(`$${amountNum.toFixed(2)}`, 165, 108);

  doc.setDrawColor(230, 230, 230);
  doc.line(20, 115, 190, 115);

  // Total
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total", 130, 128);
  doc.text(`$${amountNum.toFixed(2)}`, 165, 128);

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("This is an automatically generated invoice from IVP Africa.", 20, 270);

  doc.save(`ivp-invoice-${payment.id.slice(0, 8)}.pdf`);
}