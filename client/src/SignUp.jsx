import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_no: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isRegister
      ? "http://localhost:5000/api/auth/register"
      : "http://localhost:5000/api/auth/login";

    if (
      !formData.phone_no ||
      !formData.password ||
      (isRegister && (!formData.name || !formData.email))
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }

      if (!isRegister) {
        const { user } = data;
        localStorage.setItem("loggedInUser", JSON.stringify(user));

        if (user.role === "admin") navigate("/admin");
        else if (user.role === "owner") navigate("/customer");
        else setError("Unauthorized role. Please contact admin.");
      } else {
        alert("Registered successfully. You can now log in.");
        setIsRegister(false);
        setFormData({ name: "", email: "", phone_no: "", password: "" });
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <h1 style={styles.title}>RTO</h1>
        <h2 style={styles.subtitle}>Registration e-Services</h2>
        <p style={styles.description}>
          Centralized access to vehicle registration across India.
          Only authorized users can access the dashboard.
        </p>
        <p style={styles.note}>
          <strong>Note:</strong> Login credentials are required for access. Please contact admin for issues.
        </p>
      </div>

      <div style={styles.rightPanel}>
        <h2 style={styles.loginTitle}>{isRegister ? "REGISTER" : "LOGIN"}</h2>

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
          {isRegister && (
            <>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={styles.input}
              />

              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </>
          )}

          <label>Phone Number:</label>
          <input
            type="text"
            name="phone_no"
            value={formData.phone_no}
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

          <button type="submit" style={styles.loginBtn}>
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px" }}>
          {isRegister ? (
            <>
              Already have an account?{" "}
              <span style={styles.toggle} onClick={() => setIsRegister(false)}>
                Login here
              </span>
            </>
          ) : (
            <>
              New user?{" "}
              <span style={styles.toggle} onClick={() => setIsRegister(true)}>
                Register here
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Segoe UI, sans-serif",
    background: "#f1f5f9",
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
    fontSize: "30px",
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
  rightPanel: {
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
  toggle: {
    color: "#0ea5e9",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default LoginPage;
