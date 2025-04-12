// import React, { useEffect, useRef } from "react";
// import tt from "@tomtom-international/web-sdk-maps";
// import "@tomtom-international/web-sdk-maps/dist/maps.css";

// const TOMTOM_API_KEY = "w83B3uEXeIGgvdsTCpRZ3owyAD0H5ebB";

// const MapView = ({ stops, setMapRef }) => {
//   const mapElement = useRef();

//   useEffect(() => {
//     if (!stops.length) return;

//     const map = tt.map({
//       key: TOMTOM_API_KEY,
//       container: mapElement.current,
//       center: [parseFloat(stops[0].stop_lon), parseFloat(stops[0].stop_lat)],
//       zoom: 12,
//     });

//     // Add markers
//     new tt.Marker({ color: "green" })
//       .setLngLat([parseFloat(stops[0].stop_lon), parseFloat(stops[0].stop_lat)])
//       .setPopup(new tt.Popup().setHTML(`<b>Start: ${stops[0].stop_name}</b>`))
//       .addTo(map);

//     new tt.Marker({ color: "red" })
//       .setLngLat([
//         parseFloat(stops[stops.length - 1].stop_lon),
//         parseFloat(stops[stops.length - 1].stop_lat),
//       ])
//       .setPopup(new tt.Popup().setHTML(`<b>End: ${stops[stops.length - 1].stop_name}</b>`))
//       .addTo(map);

//     stops.forEach((stop, index) => {
//       if (index !== 0 && index !== stops.length - 1) {
//         new tt.Marker({ color: "blue" })
//           .setLngLat([parseFloat(stop.stop_lon), parseFloat(stop.stop_lat)])
//           .setPopup(new tt.Popup().setHTML(`<b>${stop.stop_name}</b>`))
//           .addTo(map);
//       }
//     });

//     setMapRef(map); // send the map object back to parent
//     return () => map.remove();
//   }, [stops]);

//   return <div ref={mapElement} id="map" style={{ width: "100%", height: "500px" }} />;
// };

// export default MapView;