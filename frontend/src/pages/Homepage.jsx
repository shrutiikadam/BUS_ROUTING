import React, { useState, useEffect } from "react";
import axios from "axios";
import tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import { motion, AnimatePresence } from "framer-motion";
import "./Homepage.css";
import { useNavigate } from "react-router-dom";
import {
  useUser,
  SignedIn,
  SignedOut,
  SignOutButton,
} from "@clerk/clerk-react";
import BusControls from "../components/BusControls";

const TOMTOM_API_KEY = "w83B3uEXeIGgvdsTCpRZ3owyAD0H5ebB";

const HomePage = () => {
  const [busNumber, setBusNumber] = useState("");
  const [stops, setStops] = useState([]);
  const [map, setMap] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!busNumber || !showPopup) return;

    setLoading(true);
    axios
      .get(`http://127.0.0.1:5000/bus/${busNumber}`)
      .then((res) => {
        setStops(res.data.stops || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [busNumber, showPopup]);

  useEffect(() => {
    if (!stops.length || !showPopup) return;

    // Initialize map after the popup has been rendered
    setTimeout(() => {
      const newMap = tt.map({
        key: TOMTOM_API_KEY,
        container: "popup-map",
        center: [parseFloat(stops[0].stop_lon), parseFloat(stops[0].stop_lat)],
        zoom: 12,
      });

      // Add markers for each stop
      stops.forEach((stop, i) => {
        new tt.Marker({
          color: i === 0 ? "green" : i === stops.length - 1 ? "red" : "blue",
        })
          .setLngLat([stop.stop_lon, stop.stop_lat])
          .addTo(newMap);
      });

      // Draw the route line between stops if there are multiple stops
      if (stops.length > 1) {
        const coordinates = stops.map((stop) => [
          parseFloat(stop.stop_lon),
          parseFloat(stop.stop_lat),
        ]);

        newMap.on("load", () => {
          newMap.addLayer({
            id: "route",
            type: "line",
            source: {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: coordinates,
                },
              },
            },
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#000",
              "line-width": 3,
              "line-opacity": 0.8,
            },
          });
        });
      }

      setMap(newMap);
      return () => newMap.remove();
    }, 300);
  }, [stops, showPopup]);

  const handleSearch = () => {
    if (!busNumber.trim()) return;
    setShowPopup(true);
  };

  const closePopup = () => {
    if (map) {
      map.remove();
      setMap(null);
    }
    setShowPopup(false);
    setStops([]);
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

      {/* Popup Window */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="popup-container"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="popup-header">
                <h2>Bus {busNumber} Route</h2>
                <button className="close-button" onClick={closePopup}>
                  ×
                </button>
              </div>

              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading bus information...</p>
                </div>
              ) : (
                <>
                  {/* Map Section (Top Half) */}
                  <div className="popup-map-container">
                    <div id="popup-map"></div>
                  </div>

                  {/* Stops Section (Bottom Half) */}
                  <div className="popup-stops-container">
                    <h3>Bus Stops</h3>
                    <div className="stops-timeline">
                      {stops.map((stop, index) => (
                        <motion.div
                          key={index}
                          className="stop-item"
                          initial={{ x: -50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                          <div className="stop-marker">
                            <div
                              className={`marker-dot ${
                                index === 0
                                  ? "start"
                                  : index === stops.length - 1
                                  ? "end"
                                  : ""
                              }`}
                            ></div>
                            {index < stops.length - 1 && (
                              <div className="connector-line"></div>
                            )}
                          </div>
                          <div className="stop-details">
                            <h4>{stop.stop_name || `Stop ${index + 1}`}</h4>
                            <p className="stop-location">
                              Location: {stop.stop_lat}, {stop.stop_lon}
                            </p>
                            {stop.arrival_time && (
                              <p className="arrival-time">
                                Arrival: {stop.arrival_time}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <BusControls
                      busNumber={busNumber}
                      stops={stops}
                      mapRef={map}
                    />
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
