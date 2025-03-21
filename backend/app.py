from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Load GTFS data
GTFS_DIR = "gtfs_mumbai"

try:
    stops_df = pd.read_csv(os.path.join(GTFS_DIR, "stops.txt"))
    routes_df = pd.read_csv(os.path.join(GTFS_DIR, "routes.txt"))
    trips_df = pd.read_csv(os.path.join(GTFS_DIR, "trips.txt"))
    stop_times_df = pd.read_csv(os.path.join(GTFS_DIR, "stop_times.txt"))
except FileNotFoundError as e:
    print(f"Error loading GTFS data: {e}")
    stops_df = routes_df = trips_df = stop_times_df = pd.DataFrame()  # Empty dataframes to prevent crashes


@app.route("/bus/<bus_number>", methods=["GET"])
def get_bus_stops(bus_number):
    """Fetch ordered stops for a given bus number"""
    if routes_df.empty:
        return jsonify({"error": "GTFS data not loaded"}), 500

    route = routes_df[routes_df["route_short_name"].astype(str) == str(bus_number)]

    if route.empty:
        return jsonify({"error": "Bus not found"}), 404

    route_id = route.iloc[0]["route_id"]
    trips = trips_df[trips_df["route_id"] == route_id]

    if trips.empty:
        return jsonify({"error": "No trips found for this bus"}), 404

    # Choose the first trip by default (can be optimized further)
    trip_id = trips.iloc[0]["trip_id"]
    stop_times = stop_times_df[stop_times_df["trip_id"] == trip_id]

    if stop_times.empty:
        return jsonify({"error": "No stop times found"}), 404

    # Merge stops with stop times to maintain the correct sequence
    stops = stop_times.merge(stops_df, on="stop_id")[["stop_id", "stop_name", "stop_lat", "stop_lon", "stop_sequence"]]
    stops = stops.sort_values(by="stop_sequence")  # Sort by stop sequence

    if stops.empty:
        return jsonify({"error": "No stops found"}), 404

    stop_list = stops[["stop_id", "stop_name", "stop_lat", "stop_lon"]].dropna().to_dict(orient="records")

    return jsonify({"bus_number": bus_number, "stops": stop_list})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)  # Allow external access