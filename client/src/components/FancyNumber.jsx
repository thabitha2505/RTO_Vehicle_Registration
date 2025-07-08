import "./FancyNumber.css";
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

function FancyNumber() {
  const [category, setCategory] = useState("");
  const [inputDigits, setInputDigits] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const vehicleId = searchParams.get("vehicle_id");
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  const generateNumbers = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/vehicle/fancy-numbers", {
        category: category,
        digits: inputDigits
      });

      console.log("API Response:", res.data); 

      if (res.data && Array.isArray(res.data.fancy_numbers)) {
        const allNumbers = res.data.fancy_numbers;

        setSuggestions(allNumbers.map((item) => ({
          id: item.id,
          number: item.vehicle_no
        })));
      } else {
        alert("Unexpected response from server");
      }
    } catch (err) {
      console.error("Error fetching fancy numbers:", err); // 🔍 more detail
      alert(err.response?.data?.message || "Failed to load fancy numbers");
    }
};


  const handleReserve = async () => {
    if (!selected || !user?.id || !vehicleId) return alert("Missing info");

    try {
      await axios.post("http://localhost:5000/api/vehicle/fancy-numbers/reserve", {
        number_id: selected.id,
        owner_id: user.id,
        vehicle_id: vehicleId
      });

      alert("Reserved successfully!");
      navigate("/customer"); 
    } catch (err) {
      alert(err.response?.data?.message || "Reservation failed");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Fancy Number Reservation</h2>

        <label>Select Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">-- Choose --</option>
          <option value="VIP">VIP (e.g. 0001, 0007)</option>
          <option value="Premium">Premium (e.g. 1111, 9999)</option>
          <option value="Custom">Custom Digits</option>
        </select>


        <label>Enter Digits</label>
        <input
          type="text"
          maxLength="4"
          placeholder="e.g. 7, 77, 999"
          value={inputDigits}
          onChange={(e) => setInputDigits(e.target.value)}
        />

        <button onClick={generateNumbers} disabled={!category || !inputDigits}>
          Show Fancy Numbers
        </button>

        {suggestions.length > 0 && (
          <div>
            <h3>Available Numbers:</h3>
            <ul className="number-list">
              {suggestions.map((numObj) => (
                <li
                  key={numObj.id}
                  className={selected?.id === numObj.id ? "selected" : ""}
                  onClick={() => setSelected(numObj)}
                >
                  {numObj.number}
                </li>
              ))}
            </ul>
          </div>
        )}

        {selected && (
          <button className="reserve" onClick={handleReserve}>
            Reserve {selected.number}
          </button>
        )}
      </div>
    </div>
  );
}

export default FancyNumber;