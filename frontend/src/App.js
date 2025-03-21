import React, { useState } from "react";
import MapComponent from "./components/MapComponent";

function App() {
  const [busNumber, setBusNumber] = useState("");

  return (
    <div>
      <h2>Find Bus Stops</h2>
      <input
        type="text"
        placeholder="Enter Bus Number"
        value={busNumber}
        onChange={(e) => setBusNumber(e.target.value)}
      />
      <button onClick={() => setBusNumber(busNumber)}>Search</button>

      {busNumber && <MapComponent busNumber={busNumber} />}
    </div>
  );
}

export default App;
