import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import axios from './axiosConfig';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Refund = () => {
    const { bookingId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [booking, setBooking] = useState(null);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [policySection, setPolicySection] = useState(1);

    // Load booking details
    useEffect(() => {
        if (!user) return;
        
        axios.get(`${API_BASE}/bookings/${bookingId}`, {
            headers: { Authorization: `Bearer ${user.token}` },
        })
        .then((res) => setBooking(res.data))
        .catch((err) => {
            console.error("Error loading booking:", err);
            setError("Unable to load booking details.");
        })
        .finally(() => setLoading(false));
    }, [bookingId, user]);

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    // Process refund
    const processRefund = async () => {
        try {
            await axios.post(`${API_BASE}/refunds/request`, {
                bookingId,
                reason
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            navigate(`/refund-success/${bookingId}`);
        } catch (err) {
            // Show the real error message from the backend if available
            const backendMsg = err?.response?.data?.message || "Failed to process refund request.";
            setError(backendMsg);
            console.error("Refund request error:", err);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Calculate refund amount based on policy
    const calculateRefundAmount = () => {
        if (!booking) return 0;
        
        const bookingDate = new Date(booking.createdAt);
        const currentDate = new Date();
        const daysDifference = Math.floor((currentDate - bookingDate) / (1000 * 60 * 60 * 24));
        
        const price = booking.total_price || 0;
        
        if (daysDifference <= 7) {
            return price * 0.9; // 90% refund if within a week
        } else if (daysDifference <= 14) {
            return price * 0.75; // 75% refund if within two weeks
        } else if (daysDifference <= 30) {
            return price * 0.5; // 50% refund if within a month
        } else {
            return price * 0.2; // 20% refund if over a month
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-gray-700">Loading booking details...</p>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Refund Status</h2>
                <div className={`mb-4 px-4 py-3 rounded ${error.includes('already requested') ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
                    {error.includes('already requested') ? (
                        <>
                            <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>✔️</span>
                            <p>Your refund request for this booking has already been submitted and is being processed.</p>
                        </>
                    ) : (
                        <p>{error}</p>
                    )}
                </div>
                <div className="mt-6 text-center">
                    <button 
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );

    if (!booking) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Not Found</h2>
                <p className="text-gray-600">We couldn't find the booking you're looking for.</p>
                <div className="mt-6">
                    <button 
                        onClick={() => navigate('/bookings')}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                    >
                        View All Bookings
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Tailwind CSS CDN */}
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
            
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Request a Refund
                        </h1>
                        <p className="mt-3 text-xl text-gray-500">
                            We're sorry to see you go. Please review our refund policy before proceeding.
                        </p>
                    </div>

                    {/* Booking Summary Card */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-10">
                        <div className="px-6 py-8">
                            <div className="flex flex-col md:flex-row">
                                <div className="w-full md:w-1/3 mb-6 md:mb-0">
                                    <img 
                                        src={booking.tour_package?.images?.[0] || 
                                            booking.hotelMeta?.image || 
                                            "/default-booking.jpg"} 
                                        alt="Booking" 
                                        className="w-full h-48 object-cover rounded" 
                                    />
                                </div>
                                <div className="w-full md:w-2/3 md:pl-8">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                        {booking.tour_package?.package_title || 
                                         booking.hotelMeta?.hotel_name || 
                                         (booking.flights?.[0]?.airline_name + " Flight") || 
                                         "Booking"}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Booking ID</p>
                                            <p className="font-medium">{booking._id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Status</p>
                                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                                booking.status === "Confirmed" ? "bg-green-100 text-green-800" : 
                                                booking.status === "Pending" ? "bg-yellow-100 text-yellow-800" : 
                                                "bg-gray-100 text-gray-800"
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Booked On</p>
                                            <p className="font-medium">{formatDate(booking.createdAt)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Travel Date</p>
                                            <p className="font-medium">
                                                {booking.startDate ? formatDate(booking.startDate) : "N/A"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Amount</p>
                                            <p className="font-medium text-lg">${booking.total_price?.toFixed(2) || "0.00"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Estimated Refund</p>
                                            <p className="font-medium text-lg text-green-600">
                                                ${calculateRefundAmount().toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Refund Policy Section */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-10">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                            <h2 className="text-xl font-bold text-white">Refund Policy</h2>
                        </div>
                        
                        <div className="px-6 py-6">
                            {/* Policy Navigation */}
                            <div className="flex mb-6 border-b">
                                <button 
                                    onClick={() => setPolicySection(1)}
                                    className={`px-4 py-2 font-medium ${policySection === 1 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                                >
                                    General
                                </button>
                                <button 
                                    onClick={() => setPolicySection(2)}
                                    className={`px-4 py-2 font-medium ${policySection === 2 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                                >
                                    Timeline
                                </button>
                                <button 
                                    onClick={() => setPolicySection(3)}
                                    className={`px-4 py-2 font-medium ${policySection === 3 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                                >
                                    Process
                                </button>
                            </div>
                            
                            {/* Policy Content */}
                            <div className="prose max-w-none">
                                {policySection === 1 && (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                                            <p className="text-blue-700">
                                                Our refund policy is designed to be fair to both our customers and our service providers.
                                            </p>
                                        </div>
                                        
                                        <h3 className="text-lg font-semibold text-gray-800">General Policy</h3>
                                        <p className="text-gray-600">
                                            We understand that plans can change. Our refund policy is structured based on how far in advance you cancel your booking.
                                            The earlier you cancel, the higher percentage of refund you will receive.
                                        </p>
                                        
                                        <h3 className="text-lg font-semibold text-gray-800">Eligibility</h3>
                                        <ul className="list-disc pl-5 text-gray-600 space-y-1">
                                            <li>All bookings are eligible for refunds subject to the cancellation timeline.</li>
                                            <li>Refunds will be processed to the original payment method used during booking.</li>
                                            <li>Processing fees are non-refundable.</li>
                                            <li>Special promotions or discounted bookings may have different refund policies.</li>
                                        </ul>
                                    </div>
                                )}
                                
                                {policySection === 2 && (
                                    <div>
                                        <div className="relative">
                                            {/* Timeline visualization */}
                                            <div className="absolute h-full w-0.5 bg-gray-200 left-9 top-0"></div>
                                            
                                            {/* Timeline items */}
                                            <div className="mb-8 flex">
                                                <div className="flex flex-col items-center mr-4">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-blue-500 bg-white z-10">
                                                        <span className="text-blue-500 font-bold">1</span>
                                                    </div>
                                                    <div className="w-0.5 h-full bg-gray-200"></div>
                                                </div>
                                                <div className="pt-1 pb-8">
                                                    <h3 className="text-lg font-bold text-gray-800">Within 7 Days of Booking</h3>
                                                    <p className="text-green-600 font-semibold">90% Refund</p>
                                                    <p className="text-gray-600 mt-2">
                                                        If you cancel within 7 days of making your booking, you will receive a 90% refund of the total amount paid.
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="mb-8 flex">
                                                <div className="flex flex-col items-center mr-4">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-blue-400 bg-white z-10">
                                                        <span className="text-blue-400 font-bold">2</span>
                                                    </div>
                                                    <div className="w-0.5 h-full bg-gray-200"></div>
                                                </div>
                                                <div className="pt-1 pb-8">
                                                    <h3 className="text-lg font-bold text-gray-800">8-14 Days After Booking</h3>
                                                    <p className="text-green-600 font-semibold">75% Refund</p>
                                                    <p className="text-gray-600 mt-2">
                                                        If you cancel between 8 and 14 days after making your booking, you will receive a 75% refund of the total amount paid.
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="mb-8 flex">
                                                <div className="flex flex-col items-center mr-4">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-blue-300 bg-white z-10">
                                                        <span className="text-blue-300 font-bold">3</span>
                                                    </div>
                                                    <div className="w-0.5 h-full bg-gray-200"></div>
                                                </div>
                                                <div className="pt-1 pb-8">
                                                    <h3 className="text-lg font-bold text-gray-800">15-30 Days After Booking</h3>
                                                    <p className="text-green-600 font-semibold">50% Refund</p>
                                                    <p className="text-gray-600 mt-2">
                                                        If you cancel between 15 and 30 days after making your booking, you will receive a 50% refund of the total amount paid.
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex">
                                                <div className="flex flex-col items-center mr-4">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-blue-200 bg-white z-10">
                                                        <span className="text-blue-200 font-bold">4</span>
                                                    </div>
                                                </div>
                                                <div className="pt-1">
                                                    <h3 className="text-lg font-bold text-gray-800">After 30 Days</h3>
                                                    <p className="text-green-600 font-semibold">20% Refund</p>
                                                    <p className="text-gray-600 mt-2">
                                                        If you cancel more than 30 days after making your booking, you will receive a 20% refund of the total amount paid.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {policySection === 3 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800">Refund Process</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                </div>
                                                <h4 className="font-medium text-gray-900 mb-2">1. Submit Request</h4>
                                                <p className="text-gray-600 text-sm">
                                                    Fill out and submit the refund request form with a valid reason for cancellation.
                                                </p>
                                            </div>
                                            
                                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <h4 className="font-medium text-gray-900 mb-2">2. Review Process</h4>
                                                <p className="text-gray-600 text-sm">
                                                    Our team will review your request within 1-3 business days and calculate the refund amount.
                                                </p>
                                            </div>
                                            
                                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <h4 className="font-medium text-gray-900 mb-2">3. Refund Issuance</h4>
                                                <p className="text-gray-600 text-sm">
                                                    Once approved, refunds will be processed within 7-14 business days to your original payment method.
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-lg font-semibold text-gray-800 mt-6">Special Circumstances</h3>
                                        <p className="text-gray-600">
                                            In case of unexpected events such as natural disasters, medical emergencies, or other extenuating circumstances, 
                                            please contact our customer support team directly. With proper documentation, we may be able to offer more favorable refund terms.
                                        </p>
                                        
                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mt-4">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-yellow-700">
                                                        All refund requests are subject to review. Fraudulent claims or abuse of our refund policy may result in account suspension.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Refund Request Form */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-4">
                            <h2 className="text-xl font-bold text-white">Request Refund</h2>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="px-6 py-6">
                            <div className="mb-6">
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Refund Request
                                </label>
                                <select
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">-- Select a reason --</option>
                                    <option value="change_of_plans">Change of Plans</option>
                                    <option value="medical_emergency">Medical Emergency</option>
                                    <option value="better_deal">Found a Better Deal</option>
                                    <option value="scheduling_conflict">Scheduling Conflict</option>
                                    <option value="service_issue">Issue with Service</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            {reason === "other" && (
                                <div className="mb-6">
                                    <label htmlFor="otherReason" className="block text-sm font-medium text-gray-700 mb-2">
                                        Please Specify
                                    </label>
                                    <textarea
                                        id="otherReason"
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Please provide details about your reason for requesting a refund..."
                                        required
                                    ></textarea>
                                </div>
                            )}
                            
                            <div className="bg-gray-50 p-4 rounded mb-6">
                                <h3 className="font-medium text-gray-800 mb-2">Refund Summary</h3>
                                <div className="flex justify-between border-b pb-2 mb-2">
                                    <span className="text-gray-600">Original Amount:</span>
                                    <span className="font-medium">${booking.total_price?.toFixed(2) || "0.00"}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2 mb-2">
                                    <span className="text-gray-600">Refund Percentage:</span>
                                    <span className="font-medium">
                                        {(calculateRefundAmount() / (booking.total_price || 1) * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Estimated Refund Amount:</span>
                                    <span className="text-green-600">${calculateRefundAmount().toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center mb-6">
                                <input 
                                    id="terms" 
                                    type="checkbox" 
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    required
                                />
                                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                    I have read and agree to the refund policy terms and conditions.
                                </label>
                            </div>
                            
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/refund-cancel/${bookingId}`)}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
                                >
                                    Request Refund
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
            {/* Confirmation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Refund Request</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to request a refund for this booking? This action cannot be undone.
                        </p>
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-6">
                            <p className="text-sm text-yellow-700">
                                You will receive ${calculateRefundAmount().toFixed(2)} as per our refund policy.
                            </p>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={processRefund}
                                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
                            >
                                Confirm Refund
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Refund;