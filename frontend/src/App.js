// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";

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

import FlightDetails from "./FlightDetails";
import HotelDetails from "./HotelDetails";
import EntertainmentDetails from "./EntertainmentDetails";
import ConfirmedBookings from "./ConfirmedBookings";
import HotelList from "./HotelList";
import HotelRoomDetails from "./HotelRoomDetails";
import BookHotel from "./BookHotel";
import FlightList from "./FlightList";
import BookFlight from "./BookFlight"; // Add at the top


import { AuthProvider } from "./contexts/AuthContext";




function AppRoutes() {
  const location = useLocation();
  const state = location.state;

  return (
    <>
      {/* Normal page routes */}
      <Routes location={state?.background || location}>
        <Route path="/" element={<TravelPack />} />
        <Route path="/tourPackages" element={<TourPackagesList />} />
        <Route path="/tourPackages/:id" element={<TourPackageDetails />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/myPackages" element={<MyCustomPackages />} />
        <Route path="/customizePackage" element={<CustomizePackage />} />
        <Route path="/customize-package" element={<CustomizePackage />} />
        <Route path="/book-package/:id" element={<BookPackage />} />
        <Route path="/myBookings" element={<MyBookings />} />
        <Route path="/flight/:id" element={<FlightDetails />} />
        <Route path="/hotel/:id" element={<HotelDetails />} />
        <Route path="/entertainment/:id" element={<EntertainmentDetails />} />
        <Route path="/confirmedBookings" element={<ConfirmedBookings />} />
        <Route path="/hotels" element={<HotelList />} />
        <Route path="/hotels/details/:id" element={<HotelRoomDetails />} />
        <Route path="/book-hotel/:id" element={<BookHotel />} />
        <Route path="/flights" element={<FlightList />} />
        <Route path="/flights/details/:id" element={<FlightDetails />} />
        <Route path="/book-flight/:id" element={<BookFlight />} />
      </Routes>

      {/* Modal version of MyBookings (only if navigated with background) */}
      {state?.background && (
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
