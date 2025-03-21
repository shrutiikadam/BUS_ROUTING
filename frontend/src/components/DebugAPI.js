import React, { useState, useEffect } from 'react';

const DebugAPI = () => {
    const [stops, setStops] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [trips, setTrips] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:5000/stops')
            .then(response => response.json())
            .then(data => setStops(data))
            .catch(error => console.error('Error fetching stops:', error));

        fetch('http://127.0.0.1:5000/routes')
            .then(response => response.json())
            .then(data => setRoutes(data))
            .catch(error => console.error('Error fetching routes:', error));

        fetch('http://127.0.0.1:5000/trips')
            .then(response => response.json())
            .then(data => setTrips(data))
            .catch(error => console.error('Error fetching trips:', error));
    }, []);

    return (
        <div>
            <h2>Stops</h2>
            <pre>{JSON.stringify(stops, null, 2)}</pre>

            <h2>Routes</h2>
            <pre>{JSON.stringify(routes, null, 2)}</pre>

            <h2>Trips</h2>
            <pre>{JSON.stringify(trips, null, 2)}</pre>
        </div>
    );
};

export default DebugAPI;
