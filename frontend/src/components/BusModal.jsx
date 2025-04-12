import React from 'react';
import './BusModal.css';
import MapView from './MapView';

const BusModal = ({ busNumber, stops, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="left-panel">
          <h2 className="bus-number">Bus {busNumber}</h2>
          <p className="direction">{stops[0]?.stop_name} → {stops[stops.length - 1]?.stop_name}</p>
          <ul className="stop-list">
            {stops.map((stop, idx) => (
              <li key={idx}>{stop.stop_name}</li>
            ))}
          </ul>
        </div>
        <div className="right-panel">
          <MapView stops={stops} />
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default BusModal;
