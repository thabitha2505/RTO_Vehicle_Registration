import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const owners = ["9487446719", "7825997799", "9876543219"];
const admin = "8189897799";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when typing
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.userId || !formData.password) {
      setError("Please enter both User ID and Password.");
      return;

    }
    if (owners.includes(formData.userId)) {
      navigate("/customer");
    } else {
      setError("Unauthorized user. Please contact admin.");
    }
    if (formData.userId === admin) {
  navigate("/admin");
} else if (owners.includes(formData.userId)) {
  localStorage.setItem("loggedInUser", formData.userId); // Save for filtering later
  navigate("/customer");
} else {
  setError("Unauthorized user. Please contact admin.");
}

  };

  return (
    <div style={styles.container}>
      {/* Left Info Panel */}
      <div style={styles.leftPanel}>
        <h1 style={styles.title}>Ministry of Road Transport & Highways</h1>
        <h2 style={styles.subtitle}>Registration e-Services</h2>
        <p style={styles.description}>
          This portal enables centralized access to vehicle registration data across 
          India. Only authorized users are allowed to access the Dashboard and 
          associated services.
        </p>
        <p style={styles.note}>
          <strong>Note:</strong> Login credentials are provided by the  
          authorized departments. Please contact admin for assistance.
        </p>
      </div>

      {/* Right Login Panel */}
      <div style={styles.loginPanel}>
        <h2 style={styles.loginTitle}>LOGIN</h2>

        {/* 🔽 Description Section */}
        <div style={{ marginBottom: "30px", fontSize: "15px", color: "#334155" }}>
          <p>🚗 <strong>Vehicle Services Provided:</strong></p>
          <ul style={{ paddingLeft: "20px", marginTop: "10px", marginBottom: "20px" }}>
            <li>Register Private and Commercial Vehicles</li>
            <li>Auto-calculated FC and Registration Expiry Dates</li>
            <li>Upload ID & Address Proofs for Verification</li>
            <li>View Your Registered Vehicle Details</li>
            <li>Download Registration Report</li>
          </ul>
          <p style={{ fontSize: "13px", color: "#64748b" }}>
            Only registered vehicle owners with valid credentials can log in and access the customer dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label>User ID (Phone Number):</label>
          <input
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.loginBtn}>Login</button>
        </form>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Segoe UI, sans-serif",
    background: "#f5f5f5",
  },
  leftPanel: {
    flex: 1,
    background: "#e2e8f0",
    padding: "60px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  title: {
    fontSize: "26px",
    color: "#0f172a",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "20px",
    color: "#334155",
    marginBottom: "20px",
  },
  description: {
    fontSize: "16px",
    color: "#475569",
    lineHeight: "1.6",
  },
  note: {
    marginTop: "30px",
    fontSize: "14px",
    color: "#1e293b",
    background: "#fff",
    padding: "15px",
    borderLeft: "4px solid #0f172a",
    borderRadius: "4px",
  },
  loginPanel: {
    flex: 0.5,
    background: "#ffffff",
    padding: "60px 40px",
    boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)",
  },
  loginTitle: {
    fontSize: "22px",
    marginBottom: "30px",
    color: "#0f172a",
    borderBottom: "2px solid #38bdf8",
    display: "inline-block",
    paddingBottom: "5px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "10px",
    fontSize: "15px",
    marginBottom: "20px",
    borderRadius: "4px",
    border: "1px solid #cbd5e1",
  },
  loginBtn: {
    backgroundColor: "#38bdf8",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "10px",
  },
  error: {
    color: "#dc2626",
    marginBottom: "10px",
    fontSize: "14px",
    fontWeight: "bold",
  },
};

export default LoginPage;