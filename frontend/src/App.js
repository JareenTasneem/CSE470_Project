// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
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

import PaymentSuccess from "./PaymentSuccess";
import PaymentCancel from "./PaymentCancel";
import ProfileCustomization from "./ProfileCustomization";
import Refund from "./Refund";
import RefundSuccess from "./RefundSuccess";
import RefundStatus from "./RefundStatus";

function AppRoutes() {
  const location = useLocation();
  const background = location.state?.background;

  return (
    <>
      <Routes location={background || location}>
        {/* ─── Main Pages ─── */}
        <Route path="/" element={<TravelPack />} />
        <Route path="/tourPackages" element={<TourPackagesList />} />
        <Route path="/tourPackages/:id" element={<TourPackageDetails />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        {/* Ritu */}
        <Route path="/profilecustomization" element={<ProfileCustomization />} />

        {/* ─── Custom Packages ─── */}
        <Route path="/customizePackage" element={<CustomizePackage />} />
        <Route path="/customize-package" element={<CustomizePackage />} />
        <Route path="/myPackages" element={<MyCustomPackages />} />
        <Route path="/book-package/:id" element={<BookPackage />} />

        {/* ─── My Bookings & Confirmed ─── */}
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/confirmedBookings" element={<ConfirmedBookings />} />
        <Route path="/my-history" element={<MyHistory />} />
        <Route path="/write-review" element={<WriteReview />} />

        {/* ─── Flights, Hotels, Entertainment ─── */}
        <Route path="/flights" element={<FlightList />} />
        <Route path="/flight/:id" element={<FlightDetails />} />
        <Route path="/hotels" element={<HotelList />} />
        <Route path="/hotel/:id" element={<HotelDetails />} />
        <Route path="/hotels/details/:id" element={<HotelRoomDetails />} />
        <Route path="/book-hotel/:id" element={<BookHotel />} />
        <Route path="/book-flight/:id" element={<BookFlight />} />
        <Route path="/book-custom-package/:id" element={<BookCustomPackage />} />
        <Route path="/entertainment/:id" element={<EntertainmentDetails />} />

        {/* ─── Payment Flow ─── */}
        <Route
          path="/payment-options/:bookingId"
          element={<PaymentOptions />}
        />
        <Route
          path="/installment-plan/:bookingId"
          element={<InstallmentPlan />}
        />
        <Route
          path="/installment-status/:bookingId"
          element={<InstallmentStatus />}
        />
        <Route path="/invoice/:paymentId" element={<Invoice />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />
        <Route path="/refund/:bookingId" element={<Refund />} />
        <Route path="/refund-success/:bookingId" element={<RefundSuccess />} />
        <Route path="/refund-status/:bookingId" element={<RefundStatus />} />
      </Routes>

      {/* Modal overlay for MyBookings if navigated with a background */}
      {background && (
        <Routes>
          <Route
            path="/myBookings"
            element={
              <MyBookingsModal onClose={() => window.history.back()} />
            }
          />
        </Routes>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
