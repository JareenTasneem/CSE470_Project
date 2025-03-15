// src/TourPackageDetails.jsx
import React, { useEffect, useState } from "react";
import axios from "./axiosConfig";
import { useParams, Link } from "react-router-dom";

function TourPackageDetails() {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/tourPackages/${id}`)
      .then((res) => {
        setPkg(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching package details:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <p style={{ padding: "20px", textAlign: "center" }}>
        Loading package details...
      </p>
    );
  }
  if (!pkg) {
    return (
      <p style={{ padding: "20px", textAlign: "center" }}>
        Package not found!
      </p>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "Poppins, sans-serif",
        backgroundColor: "#f8f8f8",
        maxWidth: "800px",
        margin: "auto"
      }}
    >
      <h1 style={{ textAlign: "center", color: "#333" }}>
        {pkg.package_title}
      </h1>
      <div style={{ textAlign: "center", margin: "20px 0" }}>
        <img
          src={pkg.images && pkg.images.length > 0 ? pkg.images[0] : "/images/temp4.jpeg"}
          alt="Package"
          style={{ width: "100%", maxWidth: "600px", borderRadius: "8px" }}
        />
      </div>
      <p style={{ fontSize: "18px", color: "#666", textAlign: "center" }}>
        <strong>Price:</strong> ${pkg.price}
      </p>
      <p style={{ fontSize: "16px", color: "#666", textAlign: "center" }}>
        <strong>Location:</strong> {pkg.location} &nbsp;|&nbsp;{" "}
        <strong>Duration:</strong> {pkg.duration}
      </p>
      <p style={{ fontSize: "16px", color: "#666", marginTop: "20px" }}>
        <strong>Details:</strong> {pkg.package_details}
      </p>

      <h3 style={{ color: "#333", marginTop: "30px" }}>Itinerary</h3>
      {pkg.itinerary && pkg.itinerary.length > 0 ? (
        <ul style={{ color: "#666" }}>
          {pkg.itinerary.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "#999" }}>No itinerary provided.</p>
      )}

      <h3 style={{ color: "#333", marginTop: "30px" }}>Inclusions</h3>
      {pkg.inclusions && pkg.inclusions.length > 0 ? (
        <ul style={{ color: "#666" }}>
          {pkg.inclusions.map((inc, idx) => (
            <li key={idx}>{inc}</li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "#999" }}>No inclusions listed.</p>
      )}

      <h3 style={{ color: "#333", marginTop: "30px" }}>Exclusions</h3>
      {pkg.exclusions && pkg.exclusions.length > 0 ? (
        <ul style={{ color: "#666" }}>
          {pkg.exclusions.map((exc, idx) => (
            <li key={idx}>{exc}</li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "#999" }}>No exclusions listed.</p>
      )}

      {/* Placeholder for further details */}
      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          background: "#fff"
        }}
      >
        <h3 style={{ color: "#333" }}>Additional Information</h3>
        <p> {pkg.additionalInfo || "Further details will be added here soon."}</p>

      </div>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Link
          to="/tourPackages"
          style={{
            padding: "10px 20px",
            backgroundColor: "#333",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "4px"
          }}
        >
          Back to Tour Packages
        </Link>
      </div>
    </div>
  );
}

export default TourPackageDetails;
