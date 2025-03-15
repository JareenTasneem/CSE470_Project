// src/TravelPack.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "./axiosConfig";
import "./styles/style.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link } from "react-router-dom";
// Import the AuthContext to access the logged-in user info
import { AuthContext } from "./contexts/AuthContext";

const TravelPack = () => {
  const [packages, setPackages] = useState([]);
  
  // Access the user and logout function from AuthContext
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/tourPackages")
      .then((response) => setPackages(response.data))
      .catch((err) => console.error("Error fetching packages:", err));
  }, []);

  return (
    <div>
      <header className="header">
        <nav className="navbar">
          <h4>Travel Agency || Travel Packs</h4>
          <ul>
            {user ? (
              <>
                <li>
                  <span>{user.name}</span>
                </li>
                <li>
                  <button onClick={logout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" style={{ textDecoration: "none", color: "inherit" }}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" style={{ textDecoration: "none", color: "inherit" }}>
                    Sign up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div
          className="content"
          style={{
            backgroundImage: 'url("/images/temp3.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="cont_bx">
            <h1>The right destination for you and your family</h1>
          </div>
          <div className="box">
            <div className="filt_box">
              <nav className="fin_nav">
                <ul>
                  <li>
                    <Link to="/" style={{ color: "white", textDecoration: "none" }}>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/tourPackages" style={{ color: "white", textDecoration: "none" }}>
                      Travel-Packs
                    </Link>
                  </li>
                  <li>
                    <Link to="/customize-package" style={{ color: "white", textDecoration: "none" }}>
                      Customize-Package
                    </Link>
                  </li>
                </ul>
              </nav>
              <div className="cards">
                <div className="card">
                  <h4>Country:</h4>
                  <input className="search" type="text" placeholder="Enter name of country" />
                </div>
                <div className="card">
                  <h4>City:</h4>
                  <input className="search" type="text" placeholder="Enter name of city" />
                </div>
                <div className="card">
                  <h4>Price:</h4>
                  <input className="search" type="text" placeholder="Price range" />
                </div>
                <div className="card">
                  <input className="button" type="button" value="Explore Now" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="offers">
        <h1>Recommendations for You</h1>
        <p>choose your next destination</p>

        <div className="cards">
          {packages.map((pkg) => (
            <div className="card" key={pkg._id} style={{ width: "300px" }}>
              <div className="img_text">
                <img
                  src={
                    pkg.images && pkg.images.length > 0
                      ? pkg.images[0]
                      : "/images/temp4.jpeg"
                  }
                  alt="Tour"
                  style={{ width: "100%", height: "150px", objectFit: "cover" }}
                />
                <h4>Included: {pkg.inclusions?.join(", ") || "No inclusions listed"}</h4>
              </div>

              <div className="cont_bx">
                <div className="price">
                  <div className="heart_chat">
                    <i className="bi bi-heart-fill">
                      <span>234</span>
                    </i>
                    <i className="bi bi-chat-fill">
                      <span>567</span>
                    </i>
                  </div>
                  <h3>{pkg.package_title}</h3>
                  <p>{pkg.package_details}</p>
                  <div className="info_price">
                    <a href="#">More Info</a>
                    <h4>${pkg.price}</h4>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="also_like">
        <div className="img_box">
          <img src="/images/temp4.jpeg" alt="temp" />
        </div>
        <div className="of_box">
          <h4>Name of offer</h4>
          <p>short description of the offer...</p>
          <h6>Included: Hotel, Tour, Food</h6>
          <button>More Info</button>
        </div>
      </div>

      <footer>
        <h4>We will be putting contact info here</h4>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea dolore beatae ipsum rerum ab
          commodi...
        </p>
      </footer>
    </div>
  );
};

export default TravelPack;
