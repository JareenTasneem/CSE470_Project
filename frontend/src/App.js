// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TravelPack from "./TravelPack";           // Your landing page
import TourPackagesList from "./TourPackagesList"; // The list page with search
import TourPackageDetails from "./TourPackageDetails"; // The detail ("view more") page

import Signup from "./Signup";
import Login from "./Login";

import CustomizePackage from "./CustomizePackage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TravelPack />} />
        <Route path="/tourPackages" element={<TourPackagesList />} />
        <Route path="/tourPackages/:id" element={<TourPackageDetails />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route path="/customize-package" element={<CustomizePackage />} />
      </Routes>
    </Router>
  );
}

export default App;
