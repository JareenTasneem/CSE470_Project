// src/MyBookingsModal.jsx
import React from "react";
import MyBookings from "./MyBookings";

const MyBookingsModal = ({ onClose }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          maxHeight: "80vh",
          overflowY: "auto",
          width: "90%",
          maxWidth: "800px",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            padding: "5px 10px",
          }}
        >
          Close
        </button>
        <MyBookings />
      </div>
    </div>
  );
};

export default MyBookingsModal;
