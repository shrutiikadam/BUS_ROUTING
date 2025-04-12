import React, { useState } from "react";
import ttServices from "@tomtom-international/web-sdk-services";
import tt from "@tomtom-international/web-sdk-maps";
import "./BusControls.css"

const TOMTOM_API_KEY = "w83B3uEXeIGgvdsTCpRZ3owyAD0H5ebB";

const BusControls = ({ busNumber, stops, mapRef }) => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [busMarker, setBusMarker] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchRoute = () => {
    if (stops.length < 2) {
      setErrorMessage("Not enough stops to plot a route.");
      return;
    }

    setErrorMessage("");

    const locations = stops.map((stop) => `${stop.stop_lon},${stop.stop_lat}`).join(":");

    ttServices.services
      .calculateRoute({
        key: TOMTOM_API_KEY,
        traffic: false,
        routeType: "shortest",
        locations,
      })
      .then((routeData) => {
        const geoJSON = routeData.toGeoJson();
        const coordinates = geoJSON.features[0].geometry.coordinates;

        if (mapRef.getLayer("route")) {
          mapRef.removeLayer("route");
          mapRef.removeSource("route");
        }

        mapRef.addSource("route", {
          type: "geojson",
          data: geoJSON,
        });

        mapRef.addLayer({
          id: "route",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#ff0000",
            "line-width": 4,
          },
        });

        setRouteCoordinates(coordinates);
      })
      .catch((error) => {
        console.error("Routing error:", error);
        setErrorMessage("Failed to plot route.");
      });
  };

  const simulateBusMovement = () => {
    if (!routeCoordinates.length || !mapRef) {
      console.error("No valid route coordinates or map not ready.");
      return;
    }

    const formattedRoute = routeCoordinates.flat().filter(
      (coord) => Array.isArray(coord) && coord.length === 2
    );

    if (busMarker) busMarker.remove();

    const marker = new tt.Marker({ color: "black" })
      .setLngLat(formattedRoute[0])
      .addTo(mapRef);

    setBusMarker(marker);

    let index = 0;

    const move = () => {
      if (index >= formattedRoute.length) return;
      marker.setLngLat(formattedRoute[index]);
      index++;
      requestAnimationFrame(() => setTimeout(move, 200));
    };

    move();
  };

  return (
    <div>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

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
          <div className="button-group">

          <button
            onClick={fetchRoute}
            style={{ marginTop: 10, marginRight: 10 }}
            className="btn-secondary"
            >
            Fetch Route
          </button>
          <button
            onClick={simulateBusMovement}
            style={{ marginTop: 10 }}
            className="btn-secondary"
            >
            Simulate Bus Movement
          </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default BusControls;
