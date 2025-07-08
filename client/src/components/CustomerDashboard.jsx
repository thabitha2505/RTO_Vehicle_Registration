import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CustomerDashboard() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");
  const [openVehicleId, setOpenVehicleId] = useState(null);

  const user = JSON.parse(localStorage.getItem("loggedInUser")); 

  useEffect(() => {
    if (!user || !user.id) {
      setError("User not logged in. Please log in again.");
      return;
    }

    const fetchVehicles = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/vehicle/allVehicles?userId=${user.id}`);
        const data = await res.json();

        if (!res.ok || !data.vehiclesInfo) {
          setError("Failed to fetch vehicle data.");
        } else {
          setVehicles(data.vehiclesInfo);
        }
      } catch (err) {
        console.error(err);
        setError("Server error. Please try again later.");
      }
    };

    fetchVehicles();
  }, [user]);

  const toggleAccordion = (vehicleId) => {
    setOpenVehicleId(openVehicleId === vehicleId ? null : vehicleId);
  };

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Segoe UI, sans-serif",
        backgroundColor: "#f9fafb",
        minHeight: "100vh"
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px"
        }}
      >
        <h2 style={{ fontSize: "20px", margin: 0, color: "#1e293b" }}>
          Welcome, {user?.name || "User"}
        </h2>
        <button
          onClick={() => {
            localStorage.removeItem("loggedInUser");
            navigate("/");
          }}
          style={{
            backgroundColor: "#ef4444",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "none",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            maxWidth: "120px"
          }}
        >
          Logout
        </button>
      </div>

      {/* Error */}
      {error && <p style={{ color: "red", marginBottom: "20px" }}>{error}</p>}

      {/* Vehicle Accordion */}
      {vehicles.map((v) => (
        <div
          key={v.vehicle_id}
          style={{
            marginBottom: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            overflow: "hidden"
          }}
        >
          <div
            onClick={() => toggleAccordion(v.vehicle_id)}
            style={{
              padding: "14px 20px",
              cursor: "pointer",
              backgroundColor: "#0f172a",
              color: "#fff",
              fontWeight: "600",
              fontSize: "16px"
            }}
          >
            Vehicle ID: {v.vehicle_id} - {v.vehicle_name}
          </div>

          {openVehicleId === v.vehicle_id && (
            <div
              style={{
                padding: "20px",
                lineHeight: "1.8",
                backgroundColor: "#f9fafb"
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px 40px"
                }}
              >
                <p><strong>Owner:</strong> {v.owner_name}</p>
                <p><strong>Vehicle Brand:</strong> {v.vehicle_brand}</p>
                <p><strong>Vehicle Model:</strong> {v.vehicle_model}</p>
                <p><strong>Fuel Type:</strong> {v.fuel_type}</p>
                <p><strong>Engine No:</strong> {v.engine_no}</p>
                <p><strong>Chassis No:</strong> {v.chassis_no}</p>
                <p><strong>Seats:</strong> {v.no_of_seats}</p>
                <p><strong>Vehicle Usage:</strong> {v.vehicle_usage_type}</p>
                <p><strong>Category:</strong> {v.vehicle_class}</p>
                <p><strong>Body Type:</strong> {v.body_type || "N/A"}</p>
                <p><strong>Lorry Type:</strong> {v.lorry_type || "N/A"}</p>
                <p><strong>Container Capacity:</strong> {v.container_capacity || "N/A"}</p>
                <p><strong>Tanker Capacity:</strong> {v.tanker_capacity || "N/A"}</p>
                <p><strong>Bus Seating Type:</strong> {v.bus_seating_type || "N/A"}</p>
                <p><strong>AC Type:</strong> {v.ac_type || "N/A"}</p>
                <p><strong>Road Tax:</strong> {v.road_tax}</p>
                <p><strong>Color:</strong> {v.color}</p>
                <p><strong>Engine Capacity:</strong> {v.engine_capacity}</p>
                <p><strong>Reg Date:</strong> {new Date(v.reg_date).toLocaleDateString()}</p>
                <p><strong>Reg Expiry:</strong> {new Date(v.reg_exp_date).toLocaleDateString()}</p>
                <p><strong>FC Expiry:</strong> {new Date(v.FC_expiry_date).toLocaleDateString()}</p>
                <p><strong>Insurance Validity:</strong> {new Date(v.insurance_validity).toLocaleDateString()}</p>
                <p><strong>Verification Status:</strong> {v.verification_status}</p>
                <p><strong>Payment Status:</strong> {v.payment_status || "N/A"}</p>
{v.verification_status === "Approved" && (
  v.payment_status === "Success" ? (
    v.rc_generated ? (
      <a
        href={v.rc_generated}
        download
        target="_blank"
        rel="noopener noreferrer"
        style={{
          marginTop: "20px",
          display: "inline-block",
          backgroundColor: "#1d4ed8",
          color: "#fff",
          padding: "8px 16px",
          borderRadius: "6px",
          textDecoration: "none",
          fontWeight: "bold"
        }}
      >
        Download RC
      </a>
    ) : (
      <p style={{ marginTop: "20px", color: "#6b7280", fontStyle: "italic" }}>
        RC not yet generated by admin.
      </p>
    )
  ) : (
    <button
      onClick={() => navigate(`/payment?vehicle_id=${v.vehicle_id}`)}
      style={{
        marginTop: "20px",
        backgroundColor: "#10b981",
        color: "#fff",
        padding: "8px 16px",
        borderRadius: "6px",
        border: "none",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer"
      }}
    >
      Proceed to Payment
    </button>
  )
)}


              </div>
            </div>
          )}
        </div>
      ))}

      {/* New Registration Button */}
      <button
        onClick={() => navigate("/customer/form")}
        style={{
          marginTop: "30px",
          backgroundColor: "#0f172a",
          color: "#fff",
          padding: "8px 16px",
          borderRadius: "6px",
          border: "none",
          fontSize: "14px",
          fontWeight: "500",
          maxWidth: "180px",
          cursor: "pointer"
        }}
      >
        + New Registration
      </button>
    </div>
  );
}

export default CustomerDashboard;
