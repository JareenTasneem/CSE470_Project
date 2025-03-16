// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages/Components
import TravelPack from "./TravelPack";
import TourPackagesList from "./TourPackagesList";
import TourPackageDetails from "./TourPackageDetails";
import Signup from "./Signup";
import Login from "./Login";
import CustomizePackage from "./CustomizePackage";
import MyCustomPackages from "./MyCustomPackages";

// Optional: If the rest of your app uses AuthContext, you can include this:
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    // If you do NOT use any AuthContext in child components, feel free to remove AuthProvider entirely:
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<TravelPack />} />
          <Route path="/tourPackages" element={<TourPackagesList />} />
          <Route path="/tourPackages/:id" element={<TourPackageDetails />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/myPackages" element={<MyCustomPackages />} />
          <Route path="/customize-package" element={<CustomizePackage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
