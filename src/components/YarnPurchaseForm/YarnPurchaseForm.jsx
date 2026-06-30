import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const YarnPurchaseForm = () => {
  const [yarns, setYarns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { id } = useParams();

  const navigate = useNavigate();
  const editMode = Boolean(id);
  const today = new Date().toISOString().split("T")[0];

  const API_BASE_URL = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://mahakali-textiles.onrender.com";

  const [formData, setFormData] = useState({
    yarnId: "",
    purchaseDate: today,
    weight: "",
    price: "",
  });

  useEffect(() => {
    fetchYarns();

    if (editMode) {
      fetchPurchase();
    }
  }, []);

  const fetchYarns = async () => {
    try {
      setFetchLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/yarns`);
      setYarns(res.data);
    } catch (err) {
      console.log(err);
      alert("Failed to load yarns.");
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchPurchase = async () => {
    const res = await axios.get(
      `${API_BASE_URL}/api/yarn-purchase/${id}`
    );

    setFormData({
      yarnId: res.data.yarnId._id,
      purchaseDate:
        res.data.purchaseDate.substring(0, 10),
      weight: res.data.weight,
      price: res.data.price
    });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const totalAmount =
    (Number(formData.weight) || 0) * (Number(formData.price) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (editMode) {
        await axios.put(
          `${API_BASE_URL}/api/yarn-purchase/${id}`,

          {
            ...formData,
            totalAmount
          }
        );
        alert("Updated");
        navigate("/yarn-purchase");
      }
      else {
        await axios.post(
          `${API_BASE_URL}/api/yarn-purchase`,
          {
            ...formData,
            totalAmount
          }
        );
        alert("Added");
      }

      alert("Purchase Added Successfully");

      setFormData({
        yarnId: "",
        purchaseDate: today,
        weight: "",
        price: "",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div style={styles.centerContainer}>
        <h3 style={styles.loadingText}>Loading system assets...</h3>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.headerContainer}>
          <h2 style={styles.heading}>Yarn Purchase</h2>
          <p style={styles.subheading}>Record and manage new yarn inventory acquisitions seamlessly.</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Yarn Material</label>
            <select
              name="yarnId"
              value={formData.yarnId}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="">Select Yarn Type</option>
              {yarns.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.yarn_name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Purchase Date</label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.formGroup, flex: 1, minWidth: "180px" }}>
              <label style={styles.label}>Weight (Kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                style={styles.input}
                placeholder="0.00"
              />
            </div>

            <div style={{ ...styles.formGroup, flex: 1, minWidth: "180px" }}>
              <label style={styles.label}>Price / Kg</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                style={styles.input}
                placeholder="₹ 0.00"
              />
            </div>
          </div>

          <div style={styles.totalContainer}>
            <span style={styles.totalLabel}>Total Amount Due</span>
            <span style={styles.totalValue}>₹ {totalAmount.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              background: loading
                ? "#cbd5e1"
                : "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Processing..." : "Confirm & Save Purchase"}
          </button>
        </form>
      </div>
    </div>
  );
};

// Premium, Modern, and Responsive Styles Overview
const styles = {
  wrapper: {
    padding: "20px 16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    background: "#f8fafc",
  },
  container: {
    width: "100%",
    maxWidth: "540px",
    padding: "40px 32px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.03)",
    background: "#ffffff",
    boxSizing: "border-box",
  },
  headerContainer: {
    textAlign: "center",
    marginBottom: "32px",
  },
  heading: {
    margin: "0 0 8px 0",
    color: "#0f172a",
    fontSize: "26px",
    fontWeight: "700",
    letterSpacing: "-0.025em",
  },
  subheading: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
    letterSpacing: "0.02em",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
    fontSize: "15px",
    color: "#1e293b",
    background: "#f8fafc",
    outline: "none",
    transition: "border-color 0.2s, background-color 0.2s",
  },
  totalContainer: {
    display: "flex",
    justifyContent: "between",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "12px 0",
    padding: "18px 20px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "12px",
  },
  totalLabel: {
    fontWeight: "600",
    color: "#166534",
    fontSize: "14px",
  },
  totalValue: {
    fontWeight: "700",
    color: "#15803d",
    fontSize: "22px",
  },
  button: {
    width: "100%",
    padding: "14px",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.2)",
    transition: "transform 0.1s ease, opacity 0.2s ease",
  },
  centerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f8fafc",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  loadingText: {
    color: "#64748b",
    fontSize: "16px",
    fontWeight: "500",
  },
};

export default YarnPurchaseForm;