// backend/Areas/Payments/Services/InvoiceService.js
const PDFDocument = require("pdfkit");

/**
 * Build a PDF invoice and return it as a Node stream.
 * @param {Object} options
 * @param {String}  options.invoiceId
 * @param {Date}    options.date
 * @param {Object}  options.booking   // populated Booking doc
 * @param {Number}  options.amount
 * @param {String}  options.note      // “Installment 1 of 3” etc.
 * @returns {PDFKit.PDFDocument}
 */
function buildInvoice({ invoiceId, date, booking, amount, note }) {
  const doc = new PDFDocument({ margin: 50 });

  /* ========== Header ========== */
  doc
    .fontSize(22)
    .text("Travel Agency Management System", { align: "center" })
    .moveDown(0.5)
    .fontSize(16)
    .text("INVOICE", { align: "center" })
    .moveDown();

  /* ========== Meta ========== */
  doc
    .fontSize(12)
    .text(`Invoice ID: ${invoiceId}`)
    .text(`Date:       ${date.toLocaleString()}`)
    .moveDown()
    .text(`Booking #:  ${booking.booking_id}`)
    .text(`Customer:   ${booking.name || "N/A"} (${booking.email || "N/A"})`)
    .text(`Status:     ${booking.status}`)
    .moveDown();

  /* ========== Booking summary ========== */
  if (booking.tour_package) {
    doc.text(`Tour Package: ${booking.tour_package}`);
  } else if (booking.custom_package) {
    doc.text("Customized Package");
  } else if (booking.flight) {
    doc.text("Flight-only Booking");
  } else if (booking.hotel) {
    doc.text("Hotel-only Booking");
  }
  if (booking.startDate) {
    doc.text(`Start Date: ${new Date(booking.startDate).toLocaleDateString()}`);
  }
  doc.moveDown();

  /* ========== Amount ========== */
  doc
    .fontSize(14)
    .text(`Amount Paid: $${amount.toFixed(2)}`)
    .moveDown();

  if (note) doc.text(note);

  /* ========== Footer ========== */
  doc
    .moveDown(2)
    .fontSize(10)
    .text("Thank you for choosing us!", { align: "center" });

  return doc;
}

module.exports = { buildInvoice };
