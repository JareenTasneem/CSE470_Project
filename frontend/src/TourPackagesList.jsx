// src/TourPackagesList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function TourPackagesList() {
  const [packages, setPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/tourPackages")
      .then((res) => {
        setPackages(res.data);
      })
      .catch((err) => console.error("Error fetching tour packages:", err));
  }, []);

  // Filter packages by search term (by package title)
  const filteredPackages = packages.filter(pkg =>
    pkg.package_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      style={{
        backgroundColor: "#f8f8f8",
        minHeight: "100vh",
        padding: "30px",
        fontFamily: "Poppins, sans-serif"
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>
        Tour Packages
      </h1>

      {/* Search Bar */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search tour packages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            width: "300px"
          }}
        />
      </div>

      {/* Packages Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px"
        }}
      >
        {filteredPackages.map((pkg) => (
          <div
            key={pkg._id}
            style={{
              background: "#fff",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div style={{ height: "180px", overflow: "hidden" }}>
              <img
                src={pkg.images && pkg.images.length > 0 ? pkg.images[0] : "/images/temp4.jpeg"}
                alt="Package"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ padding: "20px" }}>
              <h2 style={{ margin: "0 0 10px", fontSize: "20px", color: "#333", fontWeight: "600" }}>
                {pkg.package_title}
              </h2>
              <p style={{ margin: "5px 0", color: "#666" }}>
                <strong>Price:</strong> ${pkg.price}
              </p>
              <div style={{ textAlign: "center", marginTop: "15px" }}>
                <Link
                  to={`/tourPackages/${pkg._id}`}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#333",
                    color: "#fff",
                    textDecoration: "none",
                    borderRadius: "4px"
                  }}
                >
                  View More
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredPackages.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "20px", color: "#999" }}>
          No tour packages match your search.
        </p>
      )}
    </div>
  );
}

export default TourPackagesList;
