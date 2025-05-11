import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "./axiosConfig";
import { AuthContext } from "./contexts/AuthContext";
import { format } from "date-fns";
import BookingModal from "./BookingModal";

const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending", description: "Booking is awaiting confirmation", color: "amber" },
  { value: "Confirmed", label: "Confirmed", description: "Booking has been approved and confirmed", color: "emerald" },
  { value: "Cancelled", label: "Cancelled", description: "Booking has been cancelled", color: "rose" }
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
    
    // Get the position of the clicked row
    const row = rowRefs.current[rowId];
    if (row) {
      const rect = row.getBoundingClientRect();
      setModalPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    }
    
    setShowModal(true);
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
    const statusMap = {
      Pending: "bg-amber-100 text-amber-800 border border-amber-200",
      Confirmed: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      Cancelled: "bg-rose-100 text-rose-800 border border-rose-200"
    };
    return statusMap[status] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  const getStatusDot = (status) => {
    const dotColors = {
      Pending: "bg-amber-500",
      Confirmed: "bg-emerald-500",
      Cancelled: "bg-rose-500"
    };
    return dotColors[status] || "bg-gray-500";
  };

  return (
    <div className="p-7">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="py-6 px-8 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
               Booking Oversight
            </h2>
            <div className="flex items-center">
              <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium">
                Total: {bookings.length} Bookings
              </span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-8 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex flex-row flex-wrap gap-4 w-full overflow-x-auto">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm flex-1 min-w-0"
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
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm flex-1 min-w-0"
            />
            <input
              type="text"
              name="bookingId"
              value={filters.bookingId}
              onChange={handleFilterChange}
              placeholder="Search by booking ID"
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm flex-1 min-w-0"
            />
            <input
              type="text"
              name="details"
              value={filters.details}
              onChange={handleFilterChange}
              placeholder="Search in booking details"
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm flex-1 min-w-0"
            />
          </div>
        </div>

        {/* Bookings Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-500">Loading bookings...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-700">{error}</h3>
            <p className="mt-2 text-gray-500">Please try again or contact support if the problem persists.</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700">No bookings found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr 
                    key={booking._id} 
                    className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                    ref={el => rowRefs.current[booking._id] = el}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.booking_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                          {booking.user?.name?.charAt(0) || "?"}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{booking.user?.name || "N/A"}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[180px]">{booking.user?.email || "N/A"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.tour_package?.package_title || booking.flightMeta?.airline_name || booking.hotelMeta?.hotel_name || "Custom Package"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                          ${booking.total_price}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-2.5 w-2.5 rounded-full mr-2 ${getStatusDot(booking.status)}`}></div>
                        <span className={`px-2.5 py-1 inline-flex text-xs rounded-md font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{format(new Date(booking.createdAt), "MMM d, yyyy")}</div>
                      <div className="text-xs text-gray-500">{format(new Date(booking.createdAt), "h:mm a")}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => handleOpenModal(booking, booking._id)} 
                        className="inline-flex items-center px-3 py-2 border border-indigo-100 text-sm font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-150"
                      >
                        <svg style={{width:16, height:16}} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Modal */}
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