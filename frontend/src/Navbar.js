import { useState } from "react";

const Navbar = ({ onSearch }) => {
    const [busNumber, setBusNumber] = useState("");

    const handleSearch = () => {
        if (busNumber.trim() !== "") {
            onSearch(busNumber);
        }
    };

    return (
        <nav className="bg-blue-500 p-4 text-white flex justify-between">
            <h1 className="text-xl">Bus Route Finder</h1>
            <div className="flex">
                <input
                    type="text"
                    placeholder="Enter Bus Number..."
                    className="p-2 rounded text-black"
                    value={busNumber}
                    onChange={(e) => setBusNumber(e.target.value)}
                />
                <button onClick={handleSearch} className="ml-2 bg-green-500 p-2 rounded">
                    Search
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
