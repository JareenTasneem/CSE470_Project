import React, { useEffect, useState, useContext } from "react";
import axios from "./axiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";

const BookCustomPackage = () => {
  const { id } = useParams(); // Custom Package ID
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [pkg, setPkg] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    startDate: "",
    endDate: "",
    numberOfPeople: 1,
    hotelSelections: [],
    flightSelections: [],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return navigate("/");

    setFormData((prev) => ({
      ...prev,
      name: user.name || "",
      email: user.email || "",
    }));

    axios
      .get(`/customPackages/byUser/${user._id}`)
      .then((res) => {
        const found = res.data.find((p) => p._id === id);
        if (!found) {
          alert("Package not found");
          navigate(-1);
        }
        setPkg(found);
      })
      .catch((err) => console.error(err));
  }, [user, id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHotelSelection = (hotelId, field, value) => {
    setFormData((prev) => {
      const exists = prev.hotelSelections.find((h) => h.hotelId === hotelId);
      if (exists) {
        return {
          ...prev,
          hotelSelections: prev.hotelSelections.map((h) =>
            h.hotelId === hotelId ? { ...h, [field]: value } : h
          ),
        };
      } else {
        return {
          ...prev,
          hotelSelections: [...prev.hotelSelections, { hotelId, [field]: value }],
        };
      }
    });
  };
  

  const handleFlightSelection = (flightId, field, value) => {
    setFormData((prev) => {
      const exists = prev.flightSelections.find((f) => f.flightId === flightId);
      if (exists) {
        return {
          ...prev,
          flightSelections: prev.flightSelections.map((f) =>
            f.flightId === flightId ? { ...f, [field]: value } : f
          ),
        };
      } else {
        return {
          ...prev,
          flightSelections: [...prev.flightSelections, { flightId, [field]: value }],
        };
      }
    });
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post(
        "/bookings/bookCustomPackageDirect",
        {
          packageId: id,
          ...formData,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      alert("Package booked successfully!");
      navigate("/confirmedBookings");
    } catch (err) {
      console.error("Booking failed:", err);
      alert(
        err.response?.data?.message || "Failed to book package. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!pkg) return <p>Loading Package...</p>;

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fa", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "40px 0" }}>
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: 36, maxWidth: 600, width: "100%" }}>
        <h2 style={{ textAlign: "center", marginBottom: 32, fontWeight: 700, fontSize: 28, color: "#232946" }}>Book Custom Package</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500 }}>Name:</label>
              <input value={formData.name} disabled style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 }} />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500 }}>Email:</label>
              <input value={formData.email} disabled style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500 }}>Start Date:</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 }} />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500 }}>End Date:</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 }} />
            </div>
          </div>

          {/* Hotel Booking Section */}
          {pkg.hotels.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h4 style={{ color: "#393e6c", fontWeight: 600, marginBottom: 12 }}>Hotel Booking Details</h4>
              {pkg.hotels.map((hotel) => (
                <div key={hotel._id} style={{ marginBottom: 18, padding: 16, background: "#f8f9fb", borderRadius: 8 }}>
                  <h5 style={{ margin: 0, fontWeight: 500 }}>{hotel.hotel_name} <span style={{ color: "#888" }}>({hotel.location})</span></h5>
                  <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <label>Room Type:</label>
                      <select onChange={e => handleHotelSelection(hotel._id, "roomType", e.target.value)} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 }}>
                        <option value="">Select</option>
                        {hotel.room_types.map((rt, idx) => (
                          <option key={idx} value={rt.type}>{rt.type} ({rt.count} available)</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <label>Number of Rooms:</label>
                      <input type="number" min={1} onChange={e => handleHotelSelection(hotel._id, "numberOfRooms", e.target.value)} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Flight Booking Section */}
          {pkg.flights.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h4 style={{ color: "#393e6c", fontWeight: 600, marginBottom: 12 }}>Flight Booking Details</h4>
              {pkg.flights.map((flight) => (
                <div key={flight._id} style={{ marginBottom: 18, padding: 16, background: "#f8f9fb", borderRadius: 8 }}>
                  <h5 style={{ margin: 0, fontWeight: 500 }}>{flight.airline_name} <span style={{ color: "#888" }}>({flight.from} - {flight.to})</span></h5>
                  <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <label>Seat Class:</label>
                      <select onChange={e => handleFlightSelection(flight._id, "seatClass", e.target.value)} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 }}>
                        <option value="">Select</option>
                        {flight.seat_types.map((st, idx) => (
                          <option key={idx} value={st.type}>{st.type} ({st.count} available)</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <label>Number of People:</label>
                      <input type="number" min={1} onChange={e => handleFlightSelection(flight._id, "qty", e.target.value)} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Entertainment Booking Section */}
          {pkg.entertainments.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h4 style={{ color: "#393e6c", fontWeight: 600, marginBottom: 12 }}>Entertainment Booking Details</h4>
              {pkg.entertainments.map((ent) => (
                <div key={ent._id} style={{ marginBottom: 18, padding: 16, background: "#f8f9fb", borderRadius: 8 }}>
                  <h5 style={{ margin: 0, fontWeight: 500 }}>{ent.entertainmentName || ent.name} <span style={{ color: "#888" }}>{ent.location ? `(${ent.location})` : ""}</span></h5>
                  {ent.price && (
                    <div style={{ marginTop: 8, color: "#393e6c", fontWeight: 500 }}>
                      Price: ${ent.price}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Confirm Button */}
          <button type="submit" disabled={loading} style={{ marginTop: 24, background: loading ? "#6c757d" : "#2563eb", color: "#fff", padding: "14px 0", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 18, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 2px 8px rgba(35,41,70,0.07)" }}>
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookCustomPackage;
