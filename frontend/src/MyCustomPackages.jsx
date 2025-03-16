// src/MyCustomPackages.jsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import { Link } from "react-router-dom";
import axios from "./axiosConfig";

function MyCustomPackages() {
  const { user } = useContext(AuthContext);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    if (!user) return;
    axios
      .get(`http://localhost:5000/api/customPackages/byUser/${user._id}`)
      .then((res) => setPackages(res.data))
      .catch((err) => console.error("Error fetching custom packages:", err));
  }, [user]);

  // 1) Handler to delete a package
  const handleDeletePackage = async (pkgId) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    try {
      await axios.delete(`/customPackages/${pkgId}`);
      // Remove it from local state
      setPackages((prev) => prev.filter((p) => p._id !== pkgId));
    } catch (err) {
      console.error("Error deleting package:", err);
      alert("Failed to delete package.");
    }
  };

  if (!user) {
    return <p>Please login to view your custom packages.</p>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>My Custom Packages</h2>
      {packages.length === 0 ? (
        <p>No custom packages yet.</p>
      ) : (
        packages.map((pkg) => (
          <div
            key={pkg._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              margin: "15px 0",
              padding: "15px",
              background: "#fff",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h4 style={{ marginBottom: "10px" }}>
              Package ID: {pkg.custom_id}
            </h4>

            {/* Flights Section */}
            {pkg.flights && pkg.flights.length > 0 && (
              <div style={{ marginBottom: "10px" }}>
                <h5 style={{ marginBottom: "5px" }}>Flights:</h5>
                <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
                  {pkg.flights.map((f) => (
                    <li key={f._id}>
                      <strong>{f.airline_name}</strong> from{" "}
                      <em>{f.from}</em> to <em>{f.to}</em> on{" "}
                      {new Date(f.date).toLocaleDateString()} (Price: $
                      {f.price})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hotels Section */}
            {pkg.hotels && pkg.hotels.length > 0 && (
              <div style={{ marginBottom: "10px" }}>
                <h5 style={{ marginBottom: "5px" }}>Hotels:</h5>
                <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
                  {pkg.hotels.map((h) => (
                    <li key={h._id}>
                      <strong>{h.hotel_name}</strong> in{" "}
                      <em>{h.location}</em> (Price per night: ${h.price_per_night})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Entertainments Section */}
            {pkg.entertainments && pkg.entertainments.length > 0 && (
              <div style={{ marginBottom: "10px" }}>
                <h5 style={{ marginBottom: "5px" }}>Entertainments:</h5>
                <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
                  {pkg.entertainments.map((e) => (
                    <li key={e._id}>
                      <strong>{e.entertainmentName}</strong> in{" "}
                      <em>{e.location}</em> (Price: ${e.price})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Edit & Delete Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <Link
                to="/customize-package"
                state={{ packageToEdit: pkg }}
                style={{ textDecoration: "none" }}
              >
                <button
                  style={{
                    background: "#ffc107",
                    color: "#000",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Edit Package
                </button>
              </Link>

              <button
                onClick={() => handleDeletePackage(pkg._id)}
                style={{
                  background: "#dc3545",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MyCustomPackages;
