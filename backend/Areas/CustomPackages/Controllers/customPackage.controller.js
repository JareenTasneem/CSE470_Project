const CustomPackage = require("../Models/CustomPackage");
const Flight = require("../../Flights/Models/Flight");
const Hotel = require("../../Hotels/Models/Hotel");
const Entertainment = require("../../Entertainments/Models/Entertainment");
const { v4: uuidv4 } = require("uuid");

exports.createCustomPackage = async (req, res) => {
  try {
    console.log("[DEBUG] REQ.BODY:", req.body);
    const { userId, flights, hotels, entertainments } = req.body;
    const warnings = [];

    // ──────────────────────────────────────────────
    // Process flights if provided
    // ──────────────────────────────────────────────
    let finalFlights = [];
    if (flights && flights.length > 0) {
      const flightDocs = await Flight.find({ _id: { $in: flights } });
      console.log("[DEBUG] flightDocs:", flightDocs);
      // Remove flights with insufficient seats.
      const validFlights = flightDocs.filter(f => f.seats_available > 0);
      if (validFlights.length < flightDocs.length) {
        const removed = flightDocs.filter(f => f.seats_available <= 0);
        warnings.push(`Removed flights with insufficient seats: ${removed.map(f => f.airline_name).join(", ")}`);
      }
      // If multiple flights, check chaining; if only one, include it as is.
      if (validFlights.length > 0) {
        let sortedFlights = [...validFlights].sort((a, b) => new Date(a.date) - new Date(b.date));
        let chain = [sortedFlights[0]];
        for (let i = 1; i < sortedFlights.length; i++) {
          const prev = chain[chain.length - 1];
          const curr = sortedFlights[i];
          if (prev.to?.toLowerCase() === curr.from?.toLowerCase()) {
            chain.push(curr);
          } else {
            warnings.push(`Removed flight "${curr.airline_name}" because it does not chain from "${prev.to}" to "${curr.from}"`);
          }
        }
        finalFlights = chain;
      }
    }

    // ──────────────────────────────────────────────
    // Process hotels if provided
    // ──────────────────────────────────────────────
    let finalHotelIds = [];
    if (hotels && hotels.length > 0) {
      const hotelDocs = await Hotel.find({ _id: { $in: hotels } });
      console.log("[DEBUG] hotelDocs:", hotelDocs);
      // If flights exist, then require hotel location to match final flight's "to"
      if (finalFlights && finalFlights.length > 0) {
        const lastFlightDest = finalFlights[finalFlights.length - 1].to?.toLowerCase();
        const validHotels = hotelDocs.filter(h => h.location?.toLowerCase() === lastFlightDest);
        if (validHotels.length === 0) {
          warnings.push(`Removed all hotels because none match the final flight destination "${lastFlightDest}"`);
        }
        finalHotelIds = validHotels.map(h => h._id);
      } else {
        // If no flight provided, take hotels as chosen.
        finalHotelIds = hotelDocs.map(h => h._id);
      }
    }

    // ──────────────────────────────────────────────
    // Process entertainments if provided
    // ──────────────────────────────────────────────
    let finalEntIds = [];
    if (entertainments && entertainments.length > 0) {
      const entDocs = await Entertainment.find({ _id: { $in: entertainments } });
      console.log("[DEBUG] entDocs:", entDocs);
      // If hotels exist, require entertainments to match the first hotel's location.
      if (finalHotelIds && finalHotelIds.length > 0) {
        const firstHotel = await Hotel.findOne({ _id: finalHotelIds[0] });
        if (firstHotel) {
          const hotelLoc = firstHotel.location?.toLowerCase();
          const validEnts = entDocs.filter(e => e.location?.toLowerCase() === hotelLoc);
          if (validEnts.length === 0) {
            warnings.push(`Removed all entertainments because none match hotel location "${firstHotel.location}"`);
          }
          finalEntIds = validEnts.map(e => e._id);
        }
      } else {
        // If no hotel provided, take entertainments as chosen.
        finalEntIds = entDocs.map(e => e._id);
      }
    }

    // ──────────────────────────────────────────────
    // Create the custom package using whatever valid items remain
    // ──────────────────────────────────────────────
    const newCustomPackage = await CustomPackage.create({
      custom_id: uuidv4(),
      user: userId,
      flights: finalFlights.map(f => f._id),
      hotels: finalHotelIds,
      entertainments: finalEntIds,
    });

    console.log("[DEBUG] New custom package created:", newCustomPackage);
    return res.status(200).json({
      customPackage: newCustomPackage,
      warnings,
    });
  } catch (err) {
    console.error("Error in createCustomPackage:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getCustomPackagesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const packages = await CustomPackage.find({ user: userId })
      .populate("flights")
      .populate("hotels")
      .populate("entertainments");
    return res.status(200).json(packages);
  } catch (err) {
    console.error("Error fetching user's custom packages:", err);
    return res.status(500).json({ error: err.message });
  }
};
// backend/Areas/CustomPackages/Controllers/customPackage.controller.js

exports.deleteCustomPackage = async (req, res) => {
  try {
    const { id } = req.params; // or packageId
    const deletedPkg = await CustomPackage.findByIdAndDelete(id);

    if (!deletedPkg) {
      return res.status(404).json({ error: "Custom package not found." });
    }

    return res.status(200).json({ message: "Custom package deleted successfully." });
  } catch (err) {
    console.error("Error deleting custom package:", err);
    return res.status(500).json({ error: err.message });
  }
};
