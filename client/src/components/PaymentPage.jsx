import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

function PaymentPage() {
  const [searchParams] = useSearchParams();
  const [regFee, setRegFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicleDetails, setVehicleDetails] = useState({});
  const navigate = useNavigate();

  const vehicleId = searchParams.get("vehicle_id");
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  useEffect(() => {
    if (!vehicleId) return;

    const fetchRegFee = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/vehicle/fee?vehicle_id=${vehicleId}`);
        setRegFee(res.data.reg_fee);
        setVehicleDetails(res.data);
      } catch (err) {
        alert("Failed to fetch registration fee.");
      } finally {
        setLoading(false);
      }
    };

    fetchRegFee();
  }, [vehicleId]);

  const handlePayment = async () => {
    try {
      // 1. Record payment
      await axios.post("http://localhost:5000/api/vehicle/payment", {
        vehicle_id: vehicleId,
        owner_id: user.id,
        amount: regFee,
      });

      // 2. Update vehicle payment status
      await axios.post(`http://localhost:5000/api/vehicle/paymentStatus?vehicle_id=${vehicleId}`);

      alert(`✅ Payment of ₹${regFee} successful!`);
      navigate("/customer", { state: { paymentSuccess: true } });
    } catch (err) {
      console.error(err);
      alert("❌ Payment failed. Please try again.");
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;

  return (
    <div style={{
      padding: "40px",
      fontFamily: "Segoe UI, sans-serif",
      backgroundColor: "#f3f4f6",
      minHeight: "100vh"
    }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        maxWidth: "500px",
        margin: "0 auto"
      }}>
        <h2 style={{ color: "#1f2937", marginBottom: "20px" }}>
          Payment for Vehicle Registration
        </h2>

        <p><strong>Vehicle ID:</strong> {vehicleDetails.vehicle_id}</p>
        <p><strong>Vehicle Name:</strong> {vehicleDetails.vehicle_name}</p>
        <p><strong>Vehicle Brand:</strong> {vehicleDetails.vehicle_brand}</p>
        <p><strong>Registration Fee:</strong> ₹{regFee}</p>

        <button
          onClick={handlePayment}
          style={{
            marginTop: "30px",
            backgroundColor: "#2563eb",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "6px",
            fontSize: "16px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Pay ₹{regFee}
        </button>
      </div>
    </div>
  );
}

export default PaymentPage;
