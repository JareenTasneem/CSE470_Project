import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import axios from './axiosConfig';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const RefundCancel = () => {
    const { bookingId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Navigate to different pages
    const goToBookingDetails = () => {
        navigate(`/booking/${bookingId}`);
    };

    const returnToRefundRequest = () => {
        navigate(`/refund-request/${bookingId}`);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-gray-700">Loading booking details...</p>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <div className="text-red-500 text-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-center text-gray-800 mb-4">Error</h2>
                <p className="text-gray-600 text-center">{error}</p>
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

    return (
        <>
            {/* Tailwind CSS CDN */}
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
            
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8 text-center">
                            <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Refund Request Cancelled</h1>
                            <p className="text-blue-100 mt-2">Your booking remains active and unchanged.</p>
                        </div>
                        
                        {/* Content */}
                        <div className="px-6 py-8">
                            {booking && (
                                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Booking Details</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            <p className="font-medium">{booking.createdAt ? formatDate(booking.createdAt) : "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Travel Date</p>
                                            <p className="font-medium">
                                                {booking.startDate ? formatDate(booking.startDate) : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-medium text-gray-900 mb-3">What Would You Like To Do?</h3>
                                <p className="text-gray-600">
                                    Your booking is still active and no refund request has been submitted. 
                                    You can return to your booking details or reconsider requesting a refund.
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-blue-700">
                                                If you need assistance with your booking, please contact our customer service team at <span className="font-medium">support@travelpal.com</span> or call <span className="font-medium">1-800-TRAVEL-PAL</span>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer with Action Buttons */}
                        <div className="bg-gray-50 px-6 py-6 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <button 
                                onClick={goToBookingDetails}
                                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 transition duration-200 flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                                </svg>
                                View Booking Details
                            </button>
                            <button 
                                onClick={returnToRefundRequest}
                                className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition duration-200 flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Reconsider Refund
                            </button>
                        </div>
                    </div>
                    
                    {/* Additional Information Card */}
                    <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="px-6 py-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Need Help With Your Booking?</h3>
                            <p className="text-gray-600 mb-4">
                                Our customer service team is available 24/7 to assist you with any questions or changes to your booking.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="font-medium text-sm">support@travelpal.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Phone</p>
                                        <p className="font-medium text-sm">1-800-TRAVEL-PAL</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Live Chat</p>
                                        <p className="font-medium text-sm">Start a Chat</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RefundCancel;
