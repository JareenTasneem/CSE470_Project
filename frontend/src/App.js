// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TravelPack from "./TravelPack";           // Your landing page
import TourPackagesList from "./TourPackagesList"; // The list page with search
import TourPackageDetails from "./TourPackageDetails"; // The detail ("view more") page

import Signup from "./Signup";
import Login from "./Login";

<<<<<<< HEAD
import CustomizePackage from "./CustomizePackage";
=======
import CustomizePage from "./CustomizePage";
import Flights from "./Flights";
import Hotels from "./Hotels";
import Entertainments from "./Entertainments";
import CustomizeLog from "./CustomizeLog";

>>>>>>> 2d5f677e73468b7f60912c946a23119414a2ed2a

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TravelPack />} />
        <Route path="/tourPackages" element={<TourPackagesList />} />
        <Route path="/tourPackages/:id" element={<TourPackageDetails />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
<<<<<<< HEAD

        <Route path="/customize-package" element={<CustomizePackage />} />
=======
        {/* Nested routes for /customize */}
        <Route path="/customize" element={<CustomizePage />}>
          <Route path="flights" element={<Flights />} />
          <Route path="hotels" element={<Hotels />} />
          <Route path="entertainments" element={<Entertainments />} />
          <Route path="log" element={<CustomizeLog />} />
          <Route index element={<CustomizeLog />} />
        </Route>
>>>>>>> 2d5f677e73468b7f60912c946a23119414a2ed2a
      </Routes>
    </Router>
  );
}

export default App;
