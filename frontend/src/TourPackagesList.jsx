import React, { useEffect, useState, useContext } from "react";
import axios from "./axiosConfig";
import { Link } from "react-router-dom";
import MyBookingsModal from "./MyBookingsModal";
import { AuthContext } from "./contexts/AuthContext";
import Navbar from './components/Navbar';
import "./styles/style.css";

function TourPackagesList() {
  const [packages, setPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [priceSort, setPriceSort] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useContext(AuthContext);

  const [currentPage, setCurrentPage] = useState(1);
  const TPsPerPage = 21;

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/tourPackages")
      .then((res) => {
        setPackages(res.data);
      })
      .catch((err) => console.error("Error fetching tour packages:", err));
  }, []);

  useEffect(() => {
    setCurrentPage(1); // reset pagination when filters change
    }, [locationFilter, capacityFilter, priceSort]);
  

  // Apply filters one after another
  let filteredPackages = packages.filter((pkg) =>
    pkg.package_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (locationFilter.trim() !== "") {
    filteredPackages = filteredPackages.filter((pkg) =>
      pkg.location.toLowerCase().includes(locationFilter.toLowerCase())
    );
  }

  if (capacityFilter !== "") {
    filteredPackages = filteredPackages.filter(
      (pkg) => pkg.maxCapacity >= Number(capacityFilter)
    );
  }

  if (priceSort === "asc") {
    filteredPackages.sort((a, b) => a.price - b.price);
  } else if (priceSort === "desc") {
    filteredPackages.sort((a, b) => b.price - a.price);
  }

  const indexOfLastTP = currentPage * TPsPerPage;
  const indexOfFirstTP = indexOfLastTP - TPsPerPage;
  const currentTPs = filteredPackages.slice(indexOfFirstTP, indexOfLastTP);
  const totalPages = Math.ceil(filteredPackages.length / TPsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <Navbar />
      <div
        style={{
          backgroundColor: "#f8f8f8",
          minHeight: "100vh",
          padding: "30px",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "40px", color: "#333" }}>
          Tour Packages
        </h1>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "30px",
            marginBottom: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            // style={{
            //   padding: "10px",
            //   borderRadius: "4px",
            //   border: "1px solid #ccc",
            //   width: "200px",
            // }}
            className="filter-input"
          />
          <select
            value={priceSort}
            onChange={(e) => setPriceSort(e.target.value)}
            // style={{
            //   padding: "10px",
            //   borderRadius: "4px",
            //   border: "1px solid #ccc",
            // }}
            className="filter-input"
          >
            <option value="">Sort by Price</option>
            <option value="asc">Lowest to Highest</option>
            <option value="desc">Highest to Lowest</option>
          </select>
          <input
            type="number"
            placeholder="Min Capacity (1-30)"
            value={capacityFilter}
            onChange={(e) => setCapacityFilter(e.target.value)}
            // style={{
            //   padding: "10px",
            //   borderRadius: "4px",
            //   border: "1px solid #ccc",
            //   width: "150px",
            // }}
            min="1"
            max="30"
            className="filter-input"
          />
        </div>

        {/* Search Bar */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Search tour packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // style={{
            //   padding: "10px",
            //   borderRadius: "4px",
            //   border: "1px solid #ccc",
            //   width: "300px",
            // }}
            className="filter-input"
          />
        </div>

        {/* Button to open modal for booked packages */}
        {/* <div style={{ textAlign: "center", margin: "20px 0" }}>
          <Link to="/confirmedBookings">
            <button
              style={{
                padding: "10px 16px",
                backgroundColor: "#000000",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              View Confirmed Bookings
            </button>
          </Link>
        </div> */}

        {/* Packages Grid */}
        <div
          style={{
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(390px, 1fr))", 
            gap: "40px", 
            marginTop: "50px",
            width: "90%",
            justifyItems: "center",
            alignItems: "start", 
            marginLeft: "auto",        
            marginRight: "auto"
          }}
        >
          {currentTPs.map((pkg) => (
            <div
              key={pkg._id}
              style={{
                background: "#fff", 
                borderRadius: "2px", 
                // padding: "15px", 
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                width: "390px",
                transition: "all 0.3s ease-in-out",
                transform: "translateY(0px)" 
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.3)";
                e.currentTarget.style.background = "#f5f5f5"; // slightly lighter grey
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
                e.currentTarget.style.background = "#fff";
              }}
            >
              <div style={{ height: "180px", overflow: "hidden" }}>
                <img
                  src={
                    pkg.images && pkg.images.length > 0
                      ? pkg.images[0]
                      : "/images/temp4.jpeg"
                  }
                  alt="Package"
                  style={{
                    width: "100%",
                    height: "170px",
                    objectFit: "cover", 
                    borderTopRightRadius: "2px", 
                    borderTopLeftRadius: "2px"
                  }}
                />
              </div>
              <div style={{ padding: "0px" }}>
                <h3
                  style={{
                    margin: "5px 15px 5px",
                    whiteSpace: "nowrap",        
                    overflow: "hidden",          
                    textOverflow: "ellipsis"
                  }}
                >
                  {pkg.package_title}
                </h3>
                <p style={{ margin: "5px 15px", color: "#666" }}>
                  <strong>Price:</strong> ${pkg.price}
                </p>
                <p style={{ margin: "5px 15px", color: "#666" }}>
                  <strong>Availability:</strong> {pkg.availability}
                </p>
                <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
                  <div style={{ flex: 1 }}>  
                    <Link to={`/tourPackages/${pkg._id}`}>
                      <button
                        style={{
                          padding: "15px 20px",
                          backgroundColor: "#181818",
                          color: "#fff",
                          borderRight: "1px solid #333",
                          // borderTopRadius: 0,
                          borderTopLeftRadius: "0",
                          borderTopRightRadius: "0",
                          borderBottomRightRadius: "0",
                          borderBottomLeftRadius: "2px",
                          cursor: "pointer",
                          fontWeight: "500", 
                          height: "100%",
                          width: "100%"
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = "#2a2a2a";
                          e.target.style.color = "#fff";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = "#181818";
                          e.target.style.color = "#fff";
                        }}
                      >
                        View More
                      </button>
                    </Link>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Link to={`/book-package/${pkg._id}`}>
                      <button
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#181818",
                          color: "#fff",
                          border: "none",
                          borderRight: "1px solid #333",
                          borderLeft: "1px solid #333",
                          borderRadius: "0",
                          cursor: "pointer",
                          fontWeight: "500",
                          height: "100%",
                          width: "100%"
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = "#2a2a2a";
                          e.target.style.color = "#fff";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = "#181818";
                          e.target.style.color = "#fff";
                        }}
                      >
                        Book Now
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredPackages.length === 0 && (
          <p
            style={{
              textAlign: "center",
              marginTop: "30px",
              color: "#999",
            }}
          >
            No tour packages match your search.
          </p>
        )}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 64, gap: 16 }}>
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                fontSize: 14,
                padding: '4px 12px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                borderRadius: 6,
                border: '2px solid #ccc',
                background: '#fff',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#181818')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#ccc')}
            >
              Previous
            </button>

            {/* Dots */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <span
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: currentPage === i + 1 ? 'black' : '#ccc',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                fontSize: 14,
                padding: '0 30px 0 30px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                borderRadius: 6,
                border: '2px solid #ccc',
                background: '#fff',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#181818')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#ccc')}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TourPackagesList;
