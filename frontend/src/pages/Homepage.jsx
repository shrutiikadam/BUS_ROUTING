import React, { useState, useEffect } from "react";
import axios from "axios";
import tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import { motion } from "framer-motion";
import "./Homepage.css";
import { useNavigate } from "react-router-dom";
import { useUser, SignedIn, SignedOut, SignOutButton } from "@clerk/clerk-react";
import BusControls from "../components/BusControls";

const TOMTOM_API_KEY = "w83B3uEXeIGgvdsTCpRZ3owyAD0H5ebB";

const HomePage = () => {
  const [busNumber, setBusNumber] = useState("");
  const [stops, setStops] = useState([]);
  const [map, setMap] = useState(null);
  const [showMapSection, setShowMapSection] = useState(false);

  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!busNumber || !showMapSection) return;
    axios
      .get(`http://127.0.0.1:5000/bus/${busNumber}`)
      .then((res) => setStops(res.data.stops || []))
      .catch(console.error);
  }, [busNumber, showMapSection]);

  useEffect(() => {
    if (!stops.length || !showMapSection) return;

    const newMap = tt.map({
      key: TOMTOM_API_KEY,
      container: "map",
      center: [parseFloat(stops[0].stop_lon), parseFloat(stops[0].stop_lat)],
      zoom: 12,
    });

    stops.forEach((stop, i) => {
      new tt.Marker({
        color: i === 0 ? "green" : i === stops.length - 1 ? "red" : "orange",
      })
        .setLngLat([stop.stop_lon, stop.stop_lat])
        .addTo(newMap);
    });

    setMap(newMap);
    return () => newMap.remove();
  }, [stops, showMapSection]);

  const handleSearch = () => {
    setShowMapSection(true);
    setTimeout(() => {
      document
        .getElementById("map-section")
        .scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="homepage-container">
      {/* Navbar */}
      <nav className="glass-navbar">
        <div className="brand-name">TransitFlo</div>

        <div className="auth-controls">
          <SignedOut>
            <button className="login-btn" onClick={() => navigate("/auth")}>
              Login
            </button>
          </SignedOut>

          <SignedIn>
            <span className="user-info">
              Hello, <strong>{user?.firstName || user?.username}</strong>
            </span>
            <SignOutButton>
              <button className="logout-btn">Logout</button>
            </SignOutButton>
          </SignedIn>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <h1 className="hero-heading">
            Track Your <span className="gradient-text">Bus</span> in Real-Time
          </h1>
          <p className="hero-sub">
            Enter your bus number to see live stop locations, arrival times, and
            more.
          </p>
          <button
            className="cta-btn"
            onClick={() =>
              document
                .getElementById("search-section")
                .scrollIntoView({ behavior: "smooth" })
            }
          >
            Find Your Bus
          </button>
        </div>
      </section>

      {/* Search Section */}
      <section id="search-section" className="search-area">
        <input
          type="text"
          placeholder="Enter Bus Number"
          value={busNumber}
          onChange={(e) => setBusNumber(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </section>

      {/* Map Section */}
      {showMapSection && (
        <section id="map-section" className="map-display">
          <motion.div
            className="map-info"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="orange-heading">Bus Details</h2>
            <p>
              <strong>Bus Number:</strong> {busNumber}
            </p>
            <h3 className="orange-sub">Stops:</h3>
            <ul className="stops-list">
              {stops.map((stop, index) => (
                <li key={index}>{stop.stop_name}</li>
              ))}
            </ul>
            <BusControls busNumber={busNumber} stops={stops} mapRef={map} />
          </motion.div>

          <motion.div
            className="map-box"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div
              id="map"
              style={{ width: "100%", height: "500px", borderRadius: "10px" }}
            ></div>
          </motion.div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
