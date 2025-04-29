// src/components/Invoice.jsx
import React from "react";
import { useParams } from "react-router-dom";

export default function Invoice() {
  const { paymentId } = useParams();
  return (
    <div>
      <h2>Invoice</h2>
      <iframe
        src={`/api/payments/invoice/${paymentId}`}
        width="100%"
        height="800px"
        title="Invoice"
      />
    </div>
  );
}
