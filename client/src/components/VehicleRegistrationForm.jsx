import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './VehicleRegistrationForm.css';
import { useSearchParams } from "react-router-dom";


const VehicleRegistrationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    owner_id: "",
    vehicle_usage_type: "",
    body_type: "",
    lorry_type: "",
    container_capacity: "",
    tanker_capacity: "",
    bus_seating_type: "",
    ac_type: "",
    vehicle_class: "",
    vehicle_brand: "",
    vehicle_name: "",
    vehicle_model: "",
    color: "",
    chassis_no: "",
    engine_no: "",
    engine_capacity: "",
    fuel_type: "",
    no_of_seats: "",
    road_tax: "LTT",
    reg_date: new Date().toISOString().split("T")[0],
    number_type: "", 
  });

  const [passportPhoto, setPassportPhoto] = useState(null);
  const [frontPhoto, setFrontPhoto] = useState(null);
  const [leftPhoto, setLeftPhoto] = useState(null);
  const [rightPhoto, setRightPhoto] = useState(null);
  const [backPhoto, setBackPhoto] = useState(null);
  const [identityProof, setIdentityProof] = useState(null);
  const [addrProof, setAddrProof] = useState(null);
  const [vehicleInvoice, setVehicleInvoice] = useState(null);


  const [metadata, setMetadata] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filteredNames, setFilteredNames] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [filteredColors, setFilteredColors] = useState([]);
  const [filteredFuelTypes, setFilteredFuelTypes] = useState([]);
  const [filteredSeats, setFilteredSeats] = useState([]);
  const [filteredEngineCapacities, setFilteredEngineCapacities] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (user?.id) setFormData((prev) => ({ ...prev, owner_id: user.id }));

    axios.get("http://localhost:5000/api/vehicle/metadata")
      .then((res) => {
        const data = res.data.results || [];
        setMetadata(data);
        const uniqueBrands = [...new Set(data.map((item) => item.veh_brand))];
        setBrands(uniqueBrands);
      })
      .catch(() => toast.error("Failed to load vehicle metadata"));
  }, []);

  useEffect(() => {
    const { vehicle_brand, vehicle_name } = formData;

    const filtered = metadata.filter(item => item.veh_brand === vehicle_brand);
    setFilteredNames([...new Set(filtered.map((item) => item.veh_name))]);

    const match = metadata.find(
      (item) => item.veh_brand === vehicle_brand && item.veh_name === vehicle_name
    );
    if (match) {

      setFilteredSeats([match.no_of_seats]);
      setFilteredEngineCapacities([match.engine_capacity]);
    } else {
      setFilteredModels([]);
      setFilteredColors([]);
      setFilteredFuelTypes([]);
      setFilteredSeats([]);
      setFilteredEngineCapacities([]);
    }
  }, [formData.vehicle_brand, formData.vehicle_name, metadata]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = (e, setter) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf" && !file.type.startsWith("image/")) {
      toast.error("Only image or PDF files allowed");
      return;
    }
    setter(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => data.append(key, val));
    data.append("passport_photo", passportPhoto);
    data.append("photo_front", frontPhoto);
    data.append("photo_left", leftPhoto);
    data.append("photo_right", rightPhoto);
    data.append("photo_back", backPhoto);
    data.append("identity_proof", identityProof);
    data.append("addr_proof", addrProof);
    data.append("vehicle_invoice", vehicleInvoice);

    try {
      const res = await axios.post("http://localhost:5000/api/vehicle/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const vehicleId = res.data.vehicle_id;
      toast.success("Vehicle Registered! ID: " + vehicleId);

      if (formData.number_type === "fancy") {
        localStorage.setItem("registered_vehicle_id", vehicleId); // optional backup
        navigate(`/fancyNumber?vehicle_id=${vehicleId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="form-container">
      <h2>Vehicle Registration</h2>
      <form onSubmit={handleSubmit} className="form-grid" encType="multipart/form-data">

        {/* Passport photo */}
        <div className="form-group">
          <label>Owner Passport Size Photo (Image)</label>
          <input type="file" accept="image/*" onChange={(e) => handleFile(e, setPassportPhoto)} required />
        </div>

        <div className="form-group">
          <label>Vehicle Usage Type</label>
          <select name="vehicle_usage_type" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Private">Private</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>

        {formData.vehicle_usage_type === "Commercial" && (
          <>
            <div className="form-group">
              <label>Body Type</label>
              <select name="body_type" onChange={handleChange}>
                <option value="">Select</option>
                <option value="Lorry">Lorry</option>
                <option value="Bus">Bus</option>
              </select>
            </div>

            {formData.body_type === "Lorry" && (
              <>
                <div className="form-group">
                  <label>Lorry Type</label>
                  <select name="lorry_type" onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="open body">Open Body</option>
                    <option value="container">Container</option>
                    <option value="tanker">Tanker</option>
                  </select>
                </div>

                {formData.lorry_type === "container" && (
                  <div className="form-group">
                    <label>Container Capacity</label>
                    <input name="container_capacity" onChange={handleChange} />
                  </div>
                )}
                {formData.lorry_type === "tanker" && (
                  <div className="form-group">
                    <label>Tanker Capacity</label>
                    <input name="tanker_capacity" onChange={handleChange} />
                  </div>
                )}
              </>
            )}

            {formData.body_type === "Bus" && (
              <>
                <div className="form-group">
                  <label>Bus Seating Type</label>
                  <select name="bus_seating_type" onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="sleeper">Sleeper</option>
                    <option value="semi sleeper">Semi Sleeper</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>AC Type</label>
                  <select name="ac_type" onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="AC">AC</option>
                    <option value="NON-AC">Non-AC</option>
                  </select>
                </div>
              </>
            )}
          </>
        )}

        <div className="form-group">
          <label>Vehicle Class</label>
          <select name="vehicle_class" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="LMV">LMV</option>
            <option value="HMV">HMV</option>
          </select>
        </div>

        <div className="form-group">
          <label>Vehicle Brand</label>
          <select name="vehicle_brand" value={formData.vehicle_brand} onChange={handleChange} required>
            <option value="">Select Brand</option>
            {brands.map((brand, idx) => (
              <option key={idx} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Vehicle Name</label>
          <select name="vehicle_name" value={formData.vehicle_name} onChange={handleChange} required>
            <option value="">Select Vehicle</option>
            {filteredNames.map((name, idx) => (
              <option key={idx} value={name}>{name}</option>
            ))}
          </select>
        </div>


        <div className="form-group">
          <label>Model Year</label>
          <select name="vehicle_model" value={formData.vehicle_model} onChange={handleChange} required>
            <option value="">Select</option>
            {[2025, 2024, 2023, 2022, 2021, 2020].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Color</label>
          <select name="color" value={formData.color} onChange={handleChange} required>
            <option value="">Select</option>
            {["White", "Black", "Blue", "Red", "Silver", "Grey", "Green", "Yellow", "Orange"].map((color) => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </div>


        <div className="form-group">
          <label>Chassis Number</label>
          <input name="chassis_no" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Engine Number</label>
          <input name="engine_no" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Engine Capacity</label>
          <select name="engine_capacity" onChange={handleChange} required>
            <option value="">Select</option>
            {filteredEngineCapacities.map((cap, i) => <option key={i} value={cap}>{cap}</option>)}
          </select>
        </div>


        <div className="form-group">
          <label>Fuel Type</label>
          <select name="fuel_type" value={formData.fuel_type} onChange={handleChange} required>
            <option value="">Select</option>
            {["Petrol", "Diesel", "Electric", "CNG"].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>


        <div className="form-group">
          <label>No. of Seats</label>
          <select name="no_of_seats" onChange={handleChange} required>
            <option value="">Select</option>
            {filteredSeats.map((seat, i) => <option key={i} value={seat}>{seat}</option>)}
          </select>
        </div>

        {/* 4 Owner with Vehicle Proofs */}
        <div className="form-group">
          <label>Front Photo</label>
          <input type="file" accept="image/*" onChange={(e) => handleFile(e, setFrontPhoto)} required />
        </div>
        <div className="form-group">
          <label>Left Side Photo</label>
          <input type="file" accept="image/*" onChange={(e) => handleFile(e, setLeftPhoto)} required />
        </div>
        <div className="form-group">
          <label>Right Side Photo</label>
          <input type="file" accept="image/*" onChange={(e) => handleFile(e, setRightPhoto)} required />
        </div>
        <div className="form-group">
          <label>Back Photo</label>
          <input type="file" accept="image/*" onChange={(e) => handleFile(e, setBackPhoto)} required />
        </div>

        <div className="form-group">
          <label>ID Proof (PDF)</label>
          <input type="file" accept="application/pdf" onChange={(e) => handleFile(e, setIdentityProof)} required />
        </div>

        <div className="form-group">
          <label>Address Proof (PDF)</label>
          <input type="file" accept="application/pdf" onChange={(e) => handleFile(e, setAddrProof)} required />
        </div>

        <div className="form-group">
          <label>Vehicle Invoice (PDF)</label>
          <input type="file" accept="application/pdf" onChange={(e) => handleFile(e, setVehicleInvoice)} required />
        </div>

      
        <div className="form-group">
          <label>Number Selection</label>
          <select
            name="number_type"
            value={formData.number_type || ""}
            onChange={handleChange}
            required
          >
            <option value="">Choose Type</option>
            <option value="normal">Normal Number</option>
            <option value="fancy">Fancy Number</option>
          </select>
        </div>

        <button type="submit">Register</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default VehicleRegistrationForm;
