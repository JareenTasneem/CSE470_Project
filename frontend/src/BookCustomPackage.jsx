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
    if (!user) return navigate("/login");

    setFormData((prev) => ({
      ...prev,
      name: user.name,
      email: user.email,
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
      navigate("/myBookings");
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
    <div style={{ padding: "30px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Book Custom Package</h2>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input value={formData.name} disabled />

        <label>Email:</label>
        <input value={formData.email} disabled />

        <label>Start Date:</label>
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          required
        />

        <label>End Date:</label>
        <input
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          required
        />

        {/* <label>Number of People:</label>
        <input
          type="number"
          name="numberOfPeople"
          min={1}
          value={formData.numberOfPeople}
          onChange={handleChange}
          required
        /> */}

        {pkg.hotels.length > 0 && (
          <>
            <h4>Hotel Booking Details</h4>
            {pkg.hotels.map((hotel) => (
              <div key={hotel._id} style={{ marginBottom: "10px" }}>
                <h5>{hotel.hotel_name} ({hotel.location})</h5>

                <label>Room Type:</label>
                <select
                  onChange={(e) =>
                    handleHotelSelection(hotel._id, "roomType", e.target.value)
                  }
                  required
                >
                  <option value="">Select</option>
                  {hotel.room_types.map((rt, idx) => (
                    <option key={idx} value={rt.type}>
                      {rt.type} ({rt.count} available)
                    </option>
                  ))}
                </select>

                <label>Number of Rooms:</label>
                <input
                  type="number"
                  min={1}
                  onChange={(e) =>
                    handleHotelSelection(
                      hotel._id,
                      "numberOfRooms",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            ))}
          </>
        )}

        {pkg.flights.length > 0 && (
          <>
            <h4>Flight Booking Details</h4>
            {pkg.flights.map((flight) => (
              <div key={flight._id} style={{ marginBottom: "10px" }}>
                <h5>{flight.airline_name}</h5>

                <label>Seat Class:</label>
                <select
                  onChange={(e) =>
                    handleFlightSelection(flight._id, "seatClass", e.target.value)
                  }
                  required
                >
                  <option value="">Select</option>
                  {flight.seat_types.map((st, idx) => (
                    <option key={idx} value={st.type}>
                      {st.type} ({st.count} available)
                    </option>
                  ))}
                </select>

                <label>Number of People:</label>
                <input
                  type="number"
                  min={1}
                  onChange={(e) =>
                    handleFlightSelection(flight._id, "qty", e.target.value)
                  }
                  required
                />
              </div>
            ))}
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "20px",
            backgroundColor: loading ? "#6c757d" : "#007bff",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
};

export default BookCustomPackage;
