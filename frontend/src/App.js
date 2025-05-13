// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

// Pages/Components
import TravelPack from "./TravelPack";
import TourPackagesList from "./TourPackagesList";
import TourPackageDetails from "./TourPackageDetails";
import Signup from "./Signup";
import Login from "./Login";
import CustomizePackage from "./CustomizePackage";
import MyCustomPackages from "./MyCustomPackages";
import BookPackage from "./BookPackage";
import MyBookings from "./MyBookings";
import MyBookingsModal from "./MyBookingsModal";
import MyHistory from "./MyHistory";
import WriteReview from "./WriteReview";
import AdminDashboard from "./AdminDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";

import FlightList from "./FlightList";
import FlightDetails from "./FlightDetails";
import HotelList from "./HotelList";
import HotelDetails from "./HotelDetails";
import HotelRoomDetails from "./HotelRoomDetails";
import EntertainmentDetails from "./EntertainmentDetails";
import BookHotel from "./BookHotel";
import BookFlight from "./BookFlight";
import BookCustomPackage from "./BookCustomPackage";

// ** We keep ConfirmedBookings **
import ConfirmedBookings from "./ConfirmedBookings";

// New payment‑flow pages
import PaymentOptions from "./PaymentOptions";
import InstallmentPlan from "./InstallmentPlan";
import InstallmentStatus from "./InstallmentStatus";
import Invoice from "./Invoice";

import { AuthProvider } from "./contexts/AuthContext";
import { MaintenanceProvider } from "./contexts/MaintenanceContext";

import PaymentSuccess from "./PaymentSuccess";
import PaymentCancel from "./PaymentCancel";
import ProfileCustomization from "./ProfileCustomization";
import Refund from "./Refund";
import RefundSuccess from "./RefundSuccess";
import RefundStatus from "./RefundStatus";
import AdminProfileCustomization from "./AdminProfileCustomization";

function AppRoutes() {
  const location = useLocation();
  const background = location.state?.background;

  return (
    <>
      <Routes location={background || location}>
        {/* ─── Public Routes ─── */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/home" element={
          <ProtectedRoute>
            <TravelPack />
          </ProtectedRoute>
        } />
        <Route path="/tourPackages" element={<TourPackagesList />} />
        <Route path="/tourPackages/:id" element={<TourPackageDetails />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/flights" element={<FlightList />} />
        <Route path="/flight/:id" element={<FlightDetails />} />
        <Route path="/hotels" element={<HotelList />} />
        <Route path="/hotel/:id" element={<HotelDetails />} />
        <Route path="/hotels/details/:id" element={<HotelRoomDetails />} />
        <Route path="/entertainment/:id" element={<EntertainmentDetails />} />

        {/* ─── Protected Routes ─── */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/customizePackage" element={
          <ProtectedRoute>
            <CustomizePackage />
          </ProtectedRoute>
        } />
        <Route path="/customize-package" element={
          <ProtectedRoute>
            <CustomizePackage />
          </ProtectedRoute>
        } />
        <Route path="/myPackages" element={
          <ProtectedRoute>
            <MyCustomPackages />
          </ProtectedRoute>
        } />
        <Route path="/book-package/:id" element={
          <ProtectedRoute>
            <BookPackage />
          </ProtectedRoute>
        } />
        <Route path="/my-bookings" element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        } />
        <Route path="/confirmedBookings" element={
          <ProtectedRoute>
            <ConfirmedBookings />
          </ProtectedRoute>
        } />
        <Route path="/my-history" element={
          <ProtectedRoute>
            <MyHistory />
          </ProtectedRoute>
        } />
        <Route path="/write-review" element={
          <ProtectedRoute>
            <WriteReview />
          </ProtectedRoute>
        } />
        <Route path="/book-hotel/:id" element={
          <ProtectedRoute>
            <BookHotel />
          </ProtectedRoute>
        } />
        <Route path="/book-flight/:id" element={
          <ProtectedRoute>
            <BookFlight />
          </ProtectedRoute>
        } />
        <Route path="/profilecustomization" element={
          <ProtectedRoute>
            <ProfileCustomization />
          </ProtectedRoute>
        } />
        <Route path="/admin-profilecustomization" element={
          <ProtectedRoute requireAdmin>
            <AdminProfileCustomization />
          </ProtectedRoute>
        } />

        {/* ─── Payment Flow Routes ─── */}
        <Route path="/payment-options/:bookingId" element={
          <ProtectedRoute>
            <PaymentOptions />
          </ProtectedRoute>
        } />
        <Route path="/installment-plan/:bookingId" element={
          <ProtectedRoute>
            <InstallmentPlan />
          </ProtectedRoute>
        } />
        <Route path="/installment-status/:bookingId" element={
          <ProtectedRoute>
            <InstallmentStatus />
          </ProtectedRoute>
        } />
        <Route path="/invoice/:paymentId" element={
          <ProtectedRoute>
            <Invoice />
          </ProtectedRoute>
        } />
        <Route path="/payment-success" element={
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        } />
        <Route path="/payment-cancel" element={
          <ProtectedRoute>
            <PaymentCancel />
          </ProtectedRoute>
        } />
        <Route path="/refund/:bookingId" element={
          <ProtectedRoute>
            <Refund />
          </ProtectedRoute>
        } />
        <Route path="/refund-success/:bookingId" element={
          <ProtectedRoute>
            <RefundSuccess />
          </ProtectedRoute>
        } />
        <Route path="/refund-status/:bookingId" element={
          <ProtectedRoute>
            <RefundStatus />
          </ProtectedRoute>
        } />
        <Route path="/book-custom-package/:id" element={
          <ProtectedRoute>
            <BookCustomPackage />
          </ProtectedRoute>
        } />
      </Routes>

      {/* Modal overlay for MyBookings if navigated with a background */}
      {background && (
        <Routes>
          <Route
            path="/myBookings"
            element={
              <ProtectedRoute>
                <MyBookingsModal onClose={() => window.history.back()} />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <MaintenanceProvider>
          <AppRoutes />
        </MaintenanceProvider>
      </AuthProvider>
    </Router>
  );
}
