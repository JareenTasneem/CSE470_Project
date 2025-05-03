import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import axios from './axiosConfig';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const RefundSuccess = () => {
    const { bookingId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [booking, setBooking] = useState(null);
    const [refund, setRefund] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Load booking details only (handle missing refund endpoint)
    useEffect(() => {
        if (!user) return;
        
        const fetchData = async () => {
            try {
                // Get booking details
                const bookingRes = await axios.get(`${API_BASE}/bookings/${bookingId}`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setBooking(bookingRes.data);
                
                // Since the refund endpoint is not available, create mock refund data
                // based on the booking information
                setRefund({
                    status: "Processed",
                    amount: bookingRes.data.totalPrice,
                    paymentMethod: "Original Payment Method",
                    createdAt: new Date().toISOString()
                });
                
            } catch (err) {
                console.error("Error loading data:", err);
                setError("Unable to load booking details.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [bookingId, user]);

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Navigate to different pages
    const goToMyBookings = () => {
        navigate('/my-bookings');
    };

    const goToHome = () => {
        navigate('/');
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            <p className="ml-3 text-gray-700">Loading refund details...</p>
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
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
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
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center">
                            <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Refund Request Successful</h1>
                            <p className="text-green-100 mt-2">Your refund has been processed and is on its way!</p>
                        </div>
                        
                        {/* Content */}
                        <div className="px-6 py-8">
                            {booking && (
                                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Refund Details</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Booking ID</p>
                                            <p className="font-medium">{booking._id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Refund Status</p>
                                            <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                Processed
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Refund Amount</p>
                                            <p className="font-medium text-green-600">{formatCurrency(booking.totalPrice || 0)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Refund Method</p>
                                            <p className="font-medium">
                                                Original Payment Method
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Requested On</p>
                                            <p className="font-medium">{formatDate(new Date())}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Expected Processing Time</p>
                                            <p className="font-medium">3-5 Business Days</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-medium text-gray-900 mb-3">Thank You For Your Patience</h3>
                                <p className="text-gray-600">
                                    Your refund request has been processed successfully. You will receive an email confirmation shortly 
                                    with the refund details. The refund amount will be credited back to your original payment method.
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-green-700">
                                                If you have not received your refund within 5 business days, please contact our customer service team at <span className="font-medium">support@travelpal.com</span> or call <span className="font-medium">1-800-TRAVEL-PAL</span>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer with Action Buttons */}
                        <div className="bg-gray-50 px-6 py-6 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <button 
                                onClick={goToMyBookings}
                                className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition duration-200 flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                                </svg>
                                My Bookings
                            </button>
                            <button 
                                onClick={goToHome}
                                className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition duration-200 flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>
                                Return to Home
                            </button>
                        </div>
                    </div>
                    
                    {/* Additional Information Card */}
                    <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="px-6 py-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Browse New Travel Options</h3>
                            <p className="text-gray-600 mb-4">
                                Ready to plan your next adventure? Check out our latest deals and exclusive offers!
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="bg-green-100 p-2 rounded-full mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Subscribe</p>
                                        <p className="font-medium text-sm">Get travel deals</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="bg-green-100 p-2 rounded-full mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Last Minute</p>
                                        <p className="font-medium text-sm">Special offers</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="bg-green-100 p-2 rounded-full mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Destinations</p>
                                        <p className="font-medium text-sm">Explore new places</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 text-center">
                                <button 
                                    onClick={goToHome}
                                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded hover:opacity-90 transition duration-200"
                                >
                                    Explore New Destinations
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RefundSuccess;
