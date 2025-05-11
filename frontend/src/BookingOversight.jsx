import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "./axiosConfig";
import { AuthContext } from "./contexts/AuthContext";
import { format } from "date-fns";
import BookingModal from "./BookingModal";

const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending", description: "Booking is awaiting confirmation", color: "yellow" },
  { value: "Confirmed", label: "Confirmed", description: "Booking has been approved and confirmed", color: "green" },
  { value: "Cancelled", label: "Cancelled", description: "Booking has been cancelled", color: "red" }
];

export default function BookingOversight() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    customerName: "",
    bookingId: "",
    details: ""
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalPosition, setModalPosition] = useState(null);
  const rowRefs = useRef({});

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, [filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      const response = await axios.get(`/bookings/admin/all?${queryParams}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBookings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = (booking, rowId) => {
    setSelectedBooking(booking);
    setShowModal(true);
    // Get the bounding rect of the row
    const rect = rowRefs.current[rowId]?.getBoundingClientRect();
    if (rect) {
      setModalPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    } else {
      setModalPosition(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
    setModalPosition(null);
  };

  const handleUpdateStatus = async ({ status, reason }) => {
    if (!selectedBooking) return;
    try {
      const response = await axios.patch(
        `/bookings/admin/${selectedBooking._id}/status`,
        { status, reason },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setBookings(prev =>
        prev.map(booking =>
          booking._id === selectedBooking._id ? response.data.booking : booking
        )
      );
      handleCloseModal();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update booking status");
    }
  };

  const getStatusColor = (status) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    return option ? `bg-${option.color}-100 text-${option.color}-800` : "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Booking Oversight</h2>
          <span className="text-sm text-gray-500">Total Bookings: {bookings.length}</span>
        </div>
        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Filter by status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <input
            type="text"
            name="customerName"
            value={filters.customerName}
            onChange={handleFilterChange}
            placeholder="Search by customer name"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            name="bookingId"
            value={filters.bookingId}
            onChange={handleFilterChange}
            placeholder="Search by booking ID"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            name="details"
            value={filters.details}
            onChange={handleFilterChange}
            placeholder="Search in booking details"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {/* Bookings Table */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading bookings...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking, idx) => {
                  const rowId = booking._id;
                  return (
                    <tr key={rowId} className="hover:bg-gray-50" ref={el => (rowRefs.current[rowId] = el)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.booking_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="font-medium text-gray-900">{booking.user?.name || "N/A"}</div>
                          <div className="text-gray-500">{booking.user?.email || "N/A"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>
                          <div className="font-medium text-gray-900">
                            {booking.tour_package?.package_title || booking.flightMeta?.airline_name || booking.hotelMeta?.hotel_name || "Custom Package"}
                          </div>
                          <div className="text-gray-500">${booking.total_price}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>{booking.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(booking.createdAt), "MMM d, yyyy")}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleOpenModal(booking, rowId)} className="text-indigo-600 hover:text-indigo-900 px-3 py-1 rounded border border-indigo-200 bg-indigo-50">Manage</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {/* Popover Modal */}
        <BookingModal
          booking={selectedBooking}
          open={showModal}
          onClose={handleCloseModal}
          onUpdate={handleUpdateStatus}
          statusOptions={STATUS_OPTIONS}
          position={modalPosition}
        />
      </div>
    </div>
  );
} 