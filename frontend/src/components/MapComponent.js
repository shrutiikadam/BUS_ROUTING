import React, { useEffect, useState } from "react";
import axios from "axios";
import tt from "@tomtom-international/web-sdk-maps";
import ttServices from "@tomtom-international/web-sdk-services";
import "@tomtom-international/web-sdk-maps/dist/maps.css";

const TOMTOM_API_KEY = ""; // Replace with your actual TomTom API key

const MapComponent = ({ busNumber }) => {
  const [stops, setStops] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [map, setMap] = useState(null);

  // Fetch bus stops
  useEffect(() => {
    if (!busNumber) return;

    axios
      .get(`http://127.0.0.1:5000/bus/${busNumber}`)
      .then((response) => {
        if (response.data.stops && response.data.stops.length > 0) {
          setStops(response.data.stops);
          setErrorMessage("");
        } else {
          setStops([]);
          setErrorMessage(`No stops found for bus ${busNumber}`);
        }
      })
      .catch((error) => {
        console.error("API fetch error:", error);
        setStops([]);
        setErrorMessage(error.response?.data?.error || "Failed to fetch data");
      });
  }, [busNumber]);

  // Initialize TomTom Map
  useEffect(() => {
    if (!stops.length) return;

    const newMap = tt.map({
      key: TOMTOM_API_KEY,
      container: "map",
      center: [parseFloat(stops[0].stop_lon), parseFloat(stops[0].stop_lat)],
      zoom: 12,
    });

    stops.forEach((stop) => {
      new tt.Marker()
        .setLngLat([parseFloat(stop.stop_lon), parseFloat(stop.stop_lat)])
        .setPopup(new tt.Popup().setHTML(`<b>${stop.stop_name}</b>`))
        .addTo(newMap);
    });

    setMap(newMap);
    return () => newMap.remove();
  }, [stops]);

  // Function to plot route covering all stops with arrows
  const plotRoute = () => {
    if (stops.length < 2) {
      setErrorMessage("Not enough stops to plot a route.");
      return;
    }

    setErrorMessage("");

    const locations = stops
      .map((stop) => `${stop.stop_lon},${stop.stop_lat}`)
      .join(":");

    ttServices.services
      .calculateRoute({
        key: TOMTOM_API_KEY,
        traffic: false,
        routeType: "shortest",
        locations: locations,
      })
      .then((routeData) => {
        const geoJSON = routeData.toGeoJson();

        if (map.getLayer("route")) {
          map.removeLayer("route");
          map.removeSource("route");
        }
        if (map.getLayer("arrows")) {
          map.removeLayer("arrows");
        }

        // Add route line
        map.addSource("route", {
          type: "geojson",
          data: geoJSON,
        });

        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#ff0000",
            "line-width": 4,
          },
        });

        // Add arrows using default "triangle-stroked" symbol
        map.addLayer({
          id: "arrows",
          type: "symbol",
          source: "route",
          layout: {
            "symbol-placement": "line",
            "symbol-spacing": 50, // Space between arrows
            "icon-image": "triangle-stroked", // Default arrow symbol
            "icon-size": 0.8,
            "icon-rotation-alignment": "map",
            "icon-rotate": 90, // Rotate arrows for correct direction
          },
          paint: {
            "icon-color": "#ff0000", // Arrow color
          },
        });
      })
      .catch((error) => {
        console.error("Routing error:", error);
        setErrorMessage("Failed to plot route.");
      });
  };

  return (
    <div>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <div
        id="map"
        style={{ width: "100%", height: "500px", marginBottom: "20px" }}
      ></div>

      {stops.length > 0 && (
        <div>
          <h3>Bus Stops for Bus {busNumber}</h3>
          <ul>
            {stops.map((stop, index) => (
              <li key={stop.stop_id}>
                <strong>
                  {index + 1}. {stop.stop_name}
                </strong>
                <br /> 📍 Lat: {stop.stop_lat}, Lon: {stop.stop_lon}
              </li>
            ))}
          </ul>

          <button
            onClick={plotRoute}
            style={{
              marginTop: "10px",
              padding: "8px 15px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Show Full Route with Arrows
          </button>
        </div>
      )}
    </div>
  );
};

export default MapComponent;