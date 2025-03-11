// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TravelPack from "./TravelPack";           // Your landing page
import TourPackagesList from "./TourPackagesList"; // The list page with search
import TourPackageDetails from "./TourPackageDetails"; // The detail ("view more") page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TravelPack />} />
        <Route path="/tourPackages" element={<TourPackagesList />} />
        <Route path="/tourPackages/:id" element={<TourPackageDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
