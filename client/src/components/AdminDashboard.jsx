import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [openVehicleId, setOpenVehicleId] = useState(null);
  const [documents, setDocuments] = useState({});
  const [showDocs, setShowDocs] = useState({});
  const [fullscreenMedia, setFullscreenMedia] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      const res = await axios.get("http://localhost:5000/api/vehicle/allVehicles");
      const data = res.data.vehiclesInfo;

      // Show: Pending or Approved with Successful Payment
      const filtered = data.filter(
        v =>
          v.verification_status === "Pending" ||
          (v.verification_status === "Approved" && v.payment_status === "Success")
      );
      setApplications(filtered);
    };
    fetchApplications();
  }, []);

  const toggleAccordion = (vehicleId) => {
    setOpenVehicleId(openVehicleId === vehicleId ? null : vehicleId);
  };

  const fetchDocuments = async (vehicleId) => {
    const res = await axios.get(`http://localhost:5000/api/admin/documents/${vehicleId}`);
    setDocuments(prev => ({ ...prev, [vehicleId]: res.data }));
    setShowDocs(prev => ({ ...prev, [vehicleId]: true }));
  };

  const updateStatus = async (vehicleId, newStatus) => {
    await axios.put("http://localhost:5000/api/admin/updateStatus", {
      vehicle_id: vehicleId,
      status: newStatus,
    });

    // Reload applications after update
    const res = await axios.get("http://localhost:5000/api/vehicle/allVehicles");
    const data = res.data.vehiclesInfo;
    const filtered = data.filter(
      v =>
        v.verification_status === "Pending" ||
        (v.verification_status === "Approved" && v.payment_status === "Success")
    );
    setApplications(filtered);
  };

  // const generateRC = (vehicleId) => {
  //   window.open(`http://localhost:5000/api/admin/generate-rc?vehicle_id=${vehicleId}`, "_blank");
  // };

  const generateRC = async (vehicleId) => {
  try {
    const res = await axios.get(`http://localhost:5000/api/admin/generate-rc?vehicle_id=${vehicleId}`);
    
    if (res.data && res.data.rc_url) {
      alert("RC generated successfully!");

      // Optional: Reload applications to reflect rc_generated field
      const refreshed = await axios.get("http://localhost:5000/api/vehicle/allVehicles");
      const updated = refreshed.data.vehiclesInfo.filter(
        v =>
          v.verification_status === "Pending" ||
          (v.verification_status === "Approved" && v.payment_status === "Success")
      );
      setApplications(updated);
    } else {
      alert("RC generation failed. Try again.");
    }
  } catch (err) {
    console.error(err);
    alert("Server error during RC generation.");
  }
};


  return (
    <div style={{ padding: "40px", fontFamily: "Segoe UI, sans-serif", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", margin: 0, color: "#1e293b" }}>Welcome, Admin</h2>
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

      {applications.map((app) => (
        <div
          key={app.vehicle_id}
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
            onClick={() => toggleAccordion(app.vehicle_id)}
            style={{
              padding: "14px 20px",
              cursor: "pointer",
              backgroundColor: "#0f172a",
              color: "#fff",
              fontWeight: "600",
              fontSize: "16px"
            }}
          >
            Vehicle ID: {app.vehicle_id} - {app.vehicle_name}
          </div>

          {openVehicleId === app.vehicle_id && (
            <div style={{ padding: "20px", backgroundColor: "#f9fafb" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 40px" }}>
                <p><strong>Owner:</strong> {app.owner_name}</p>
                <p><strong>Vehicle Brand:</strong> {app.vehicle_brand}</p>
                <p><strong>Vehicle Model:</strong> {app.vehicle_model}</p>
                <p><strong>Fuel Type:</strong> {app.fuel_type}</p>
                <p><strong>Engine No:</strong> {app.engine_no}</p>
                <p><strong>Chassis No:</strong> {app.chassis_no}</p>
                <p><strong>Seats:</strong> {app.no_of_seats}</p>
                <p><strong>Vehicle Usage:</strong> {app.vehicle_usage_type}</p>
                <p><strong>Body Type:</strong> {app.body_type}</p>
                <p><strong>Category:</strong> {app.vehicle_class}</p>
                <p><strong>Road Tax:</strong> {app.road_tax}</p>
                <p><strong>Reg Date:</strong> {new Date(app.reg_date).toLocaleDateString()}</p>
                <p><strong>Insurance Validity:</strong> {new Date(app.insurance_validity).toLocaleDateString()}</p>
                <p><strong>Verification Status:</strong> {app.verification_status}</p>
                <p><strong>Payment Status:</strong> {app.payment_status || "N/A"}</p>
              </div>

              <button
                onClick={() => fetchDocuments(app.vehicle_id)}
                style={{
                  marginTop: "20px",
                  backgroundColor: "#0f172a",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer"
                }}
              >
                View Documents
              </button>

              {showDocs[app.vehicle_id] && (
                <>
                  <div style={{ display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
                    {["identity_proof", "addr_proof", "vehicle_invoice"].map((key) => {
                      const url = documents[app.vehicle_id]?.[key];
                      return url ? (
                        <iframe
                          key={key}
                          src={url + "#zoom=85"}
                          style={{ width: "240px", height: "300px", border: "1px solid #ccc", cursor: "pointer" }}
                          onClick={() => setFullscreenMedia({ type: "pdf", url })}
                        />
                      ) : null;
                    })}
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop: "20px" }}>
                    {["photo_front", "photo_left", "photo_right", "photo_back"].map((key) => {
                      const img = documents[app.vehicle_id]?.[key];
                      return img ? (
                        <img
                          key={key}
                          src={img}
                          alt={key}
                          style={{ width: "200px", height: "150px", objectFit: "cover", borderRadius: "8px", cursor: "pointer" }}
                          onClick={() => setFullscreenMedia({ type: "image", url: img })}
                        />
                      ) : null;
                    })}
                  </div>

                  <div style={{ marginTop: "20px" }}>
                    {app.verification_status === "Pending" ? (
                      <>
                        <button
                          onClick={() => updateStatus(app.vehicle_id, "Approved")}
                          style={{ marginRight: "10px", backgroundColor: "#10b981", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(app.vehicle_id, "Rejected")}
                          style={{ backgroundColor: "#ef4444", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                        >
                          Reject
                        </button>
                      </>
                    ) : app.verification_status === "Approved" && app.payment_status === "Success" ? (
                      <button
                        onClick={() => generateRC(app.vehicle_id)}
                        style={{ backgroundColor: "#1d4ed8", color: "white", padding: "8px 16px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        Generate RC
                      </button>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Fullscreen Modal for Image/PDF */}
      {fullscreenMedia && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
          }}
          onClick={() => setFullscreenMedia(null)}
        >
          {fullscreenMedia.type === "pdf" ? (
            <iframe
              src={fullscreenMedia.url + "#zoom=120"}
              style={{ width: "90vw", height: "90vh", border: "none", borderRadius: "10px" }}
            />
          ) : (
            <img
              src={fullscreenMedia.url}
              alt="Full Preview"
              style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: "10px" }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;