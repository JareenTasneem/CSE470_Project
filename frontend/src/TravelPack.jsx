// src/TravelPack.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/style.css"; // local CSS
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link } from "react-router-dom";  // import Link for routing

const TravelPack = () => {
  // (Optional: You may fetch packages here if needed for recommendations.)
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/tourPackages")
      .then((response) => setPackages(response.data))
      .catch((err) => console.error("Error fetching packages:", err));
  }, []);

  return (
    <div>
      {/* Header Section */}
      <header className="header">
        <nav className="navbar">
          <h4>Travel Agency || Travel Packs</h4>
          <ul>
            <li><a href="#">Login</a></li>
            <li><a href="#">Sign up</a></li>
            {/* Remove any duplicate top-right Travel-Packs button */}
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
                  <li><a href="#">Home</a></li>
                  {/* Middle navbar Travel-Packs link */}
                  <li>
                    <Link to="/tourPackages" style={{ color: "white", textDecoration: "none" }}>
                      Travel-Packs
                    </Link>
                  </li>
                  <li><a href="#">Hotels</a></li>
                  <li><a href="#">Flights</a></li>
                  <li><a href="#">Entertainments</a></li>
                </ul>
              </nav>
              <div className="cards">
                {/* (Filter cards here can remain or be simplified) */}
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

      {/* Offers Section (Optional: You can leave this as is) */}
      <div className="offers">
        <h1>Recommendations for You</h1>
        <p>choose your next destination</p>
        <div className="cards">
          {packages.map((pkg) => (
            <div className="card" key={pkg._id} style={{ width: "300px" }}>
              <div className="img_text">
                <img src="/images/temp4.jpeg" alt="" />
                <h4>Included: {pkg.inclusions?.join(", ")}</h4>
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

      {/* Example "Also Like" Section */}
      <div className="also_like">
        <div className="img_box">
          <img src="/images/temp4.jpeg" alt="temp" />
        </div>
        <div className="of_box">
          <h4>Name of offer</h4>
          <p>short description of the offer. ...</p>
          <h6>Included: Hotel, Tour, Food</h6>
          <button>More Info</button>
        </div>
      </div>

      <footer>
        <h4>We will be putting contact info here</h4>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea dolore beatae ipsum rerum ab commodi...</p>
      </footer>
    </div>
  );
};

export default TravelPack;
