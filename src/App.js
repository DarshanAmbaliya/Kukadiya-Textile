import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useNavigate, NavLink } from 'react-router-dom';
import { UAParser } from 'ua-parser-js';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import './App.css';

// Page Imports
import Homepage from './pages/HomePage/Homepage';
import AttendancePage from './pages/AttendancePage';
import AttendanceRecord from './pages/AttendanceRecord';
import Production from './pages/Production/Production';
import Fabricquality from './components/FabricQuality/Fabricquality';
import ProductionReport from './pages/ProductionReport/ProductionReport';
import AdminReport from './pages/AdminReport/AdminReport';
import YarnQuality from './components/YarnQuality/YarnQuality';
import Header from './components/Header/Header';
import DashboardChart from './pages/DashboardChart/DashboardChart';
import Expense from './components/Expense/Expense';
import ExpenseReport from './pages/ExpenseReport/ExpenseReport';
import ExpenseChart from './pages/ExpenseReport/ExpenseChart';
import YarnPurchaseForm from './components/YarnPurchaseForm/YarnPurchaseForm';
import YarnPurchaseReport from './pages/YarnPurchaseReport/YarnPurchaseReport';
import axios from 'axios';

const getDeviceDetails = () => {
  const parser = new UAParser();
  const res = parser.getResult();
  const vendor = res.device.vendor || "";
  const model = res.device.model || "";
  const os = res.os.name || "";
  if (!vendor && !model) return `Desktop (${os})`;
  return `${vendor} ${model} (${os})`.trim();
};

function App() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      const parsedData = JSON.parse(savedUser);
      const today = new Date().toLocaleDateString();

      if (parsedData.loginDate === today) {
        setCurrentUser(parsedData);
      } else {
        localStorage.removeItem('authUser');
        setCurrentUser(null);
      }
    }
    setLoading(false); // important
  }, []);

  // PASTE YOUR URL HERE
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxkxVbbJ-Oje-ajmz_sMEfW3sczjn-WiB6K3_eEdxphL1NXwV7dUKs3VKg6O2XJtaaX/exec";

  const logToSheet = async (user, status) => {
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user.username,
          role: user.role,
          device: user.device,
          status: status,
          browser: navigator.userAgent,
          url: window.location.href,
          ip: ""
        }),
      });

      console.log("Log sent");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      const parsedData = JSON.parse(savedUser);
      const today = new Date().toLocaleDateString();
      if (parsedData.loginDate === today) {
        setCurrentUser(parsedData);
      } else {
        localStorage.removeItem('authUser');
        setCurrentUser(null);
      }
    }
  }, []);

  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://kukadiya-textile.onrender.com";

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        {
          username: credentials.username,
          password: credentials.password,
        }
      );

      if (data.success) {
        const deviceInfo = getDeviceDetails();

        const sessionData = {
          ...data.user,
          device: deviceInfo,
          loginDate: new Date().toLocaleDateString(),
        };

        logToSheet(sessionData, "Login");

        setCurrentUser(sessionData);

        localStorage.setItem(
          "authUser",
          JSON.stringify(sessionData)
        );

        setError("");

        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed"
      );
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      // SEND LOGOUT STATUS
      logToSheet(currentUser, "Logout");
    }
    setCurrentUser(null);
    localStorage.removeItem('authUser');
    setCredentials({ username: '', password: '' });
    navigate('/');
  };

  const ProtectedRoute = ({ currentUser, loading, children }) => {
    if (loading) return null; // or loader

    if (!currentUser) {
      return <Navigate to="/" />;
    }
    return children;
  };
  if (loading) return <div>Loading...</div>;
  return (
    <div className="App">
      <Header currentUser={currentUser} onLoginClick={() => setShowLogin(true)} onLogout={handleLogout} />

      {showLogin && !currentUser && (
        <section
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#fff",
              padding: "35px",
              borderRadius: "18px",
              boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
              position: "relative",
            }}
          >
            <div
              onClick={() => setShowLogin(false)}
              style={{
                position: "absolute",
                right: "18px",
                top: "10px",
                fontSize: "30px",
                cursor: "pointer",
                color: "#555",
              }}
            >
              ×
            </div>

            <h2
              style={{
                textAlign: "center",
                color: "#185a9d",
                marginBottom: "5px",
              }}
            >
              Kukadiya Textile
            </h2>

            <h3
              style={{
                textAlign: "center",
                marginBottom: "25px",
                color: "#333",
              }}
            >
              Login Form
            </h3>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "6px",
                  }}
                >
                  Username
                </label>

                <input
                  type="text"
                  placeholder="Enter username"
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      username: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    fontSize: "15px",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "6px",
                  }}
                >
                  Password
                </label>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      password: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    fontSize: "15px",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  marginBottom: "20px",
                }}
              >
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() =>
                    setShowPassword(!showPassword)
                  }
                />

                <span>
                  Show Password
                </span>
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#185a9d",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Login
              </button>

            </form>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >

              <NavLink
                to="/register"
                onClick={(e) => {
                  e.preventDefault();
                  setShowLogin(false);
                  const pin = window.prompt("Enter Security PIN");
                  if (pin === "5141") {
                    navigate("/register");
                  } else {
                    alert("Invalid PIN");
                  }
                }}
                style={{
                  color: "#185a9d",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Create Account
              </NavLink>

              <NavLink
                to="/reset-password"
                onClick={(e) => {
                  e.preventDefault();
                  setShowLogin(false);
                  const pin = window.prompt("Enter Security PIN");
                  if (pin === "5141") {
                    navigate("/reset-password");
                  } else {
                    alert("Invalid PIN");
                  }
                }}
                style={{
                  color: "#185a9d",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Forgot Password?
              </NavLink>

            </div>

            {error && (
              <p
                style={{
                  color: "red",
                  textAlign: "center",
                  marginTop: "15px",
                  fontWeight: "600",
                }}
              >
                {error}
              </p>
            )}
          </div>
        </section>
      )}

      {
        currentUser && (
          <section className='admin-button-section'>
            <div className="container">
              <div className="row">
                <ul style={{
                  listStyle: "none",
                  padding: 0,
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  flexWrap: "wrap"
                }}>

                  {/* Common Links */}
                  <li>
                    <NavLink to="/attendance" style={navStyle("#4CAF50")}>
                      Daily Attendance
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to="/production" style={navStyle("#2196F3")}>
                      Daily Production
                    </NavLink>
                  </li>

                  {/* Admin Only Links */}
                  {(currentUser.role === "admin" || currentUser.role === "site_developer") && (
                    <>
                      <li>
                        <NavLink to="/attendancerecord" style={navStyle("#ff9800")}>
                          Attendance Record
                        </NavLink>
                      </li>

                      <li>
                        <NavLink to="/productionreport" style={navStyle("#9c27b0")}>
                          Production Report
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/fabric"
                          style={navStyle("#3F51B5")}
                        >
                          Add Fabric
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/yarn"
                          style={navStyle("#334155")}
                        >
                          Add Yarn
                        </NavLink>
                      </li>
                    </>
                  )}

                  <li>
                    <NavLink to="/adminreport" style={navStyle("#f44336")}>
                      Admin Report
                    </NavLink>
                  </li>
                  {(currentUser.role === "site_developer") && (
                    <li>
                      <NavLink to="/dashboard" style={navStyle("#00bcd4")}>
                        Chart
                      </NavLink>
                    </li>
                  )}
                  {(currentUser.role === "site_developer") && (
                    <li>
                      <NavLink to="/expense" style={navStyle("#673AB7")}>
                        Add Expense
                      </NavLink>
                    </li>
                  )}
                  {(currentUser.role === "site_developer") && (
                    <li>
                      <NavLink to="/expense-report" style={navStyle("#795548")}>
                        Expense Report
                      </NavLink>
                    </li>
                  )}
                  {(currentUser.role === "site_developer") && (
                    <li>
                      <NavLink to="/expense-chart" style={navStyle("#2E8B57")}>
                        Expense Chart
                      </NavLink>
                    </li>
                  )}
                  {(currentUser.role === "admin" || currentUser.role === "site_developer") && (
                    <li>
                      <NavLink to="/yarn-report" style={navStyle("#f58bf8")}>
                        Yarn Report
                      </NavLink>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </section>
        )
      }
      <Routes>
        {/* Public Route */}
        <Route path='/' element={<Homepage currentUser={currentUser} />} />
        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* Protected Routes (Login Required) */}
        <Route path='/attendance' element={
          <ProtectedRoute currentUser={currentUser}>
            <AttendancePage currentUser={currentUser} />
          </ProtectedRoute>
        } />

        <Route path='/dashboard' element={
          <ProtectedRoute currentUser={currentUser}>
            {(currentUser?.role === 'site_developer') ? <DashboardChart /> : <Navigate to="/" />}
          </ProtectedRoute>
        } />
        <Route path='/expense' element={
          <ProtectedRoute currentUser={currentUser}>
            {(currentUser?.role === 'site_developer') ? <Expense /> : <Navigate to="/" />}
          </ProtectedRoute>
        } />

        <Route path='/expense-report' element={
          <ProtectedRoute currentUser={currentUser}>
            {(currentUser?.role === 'site_developer') ? <ExpenseReport /> : <Navigate to="/" />}
          </ProtectedRoute>
        } />

        <Route path='/production' element={
          <ProtectedRoute currentUser={currentUser}>
            <Production />
          </ProtectedRoute>
        } />

        <Route path='/production/:date' element={
          <ProtectedRoute currentUser={currentUser}>
            <Production />
          </ProtectedRoute>
        } />

        <Route path='/fabric' element={
          <ProtectedRoute currentUser={currentUser}>
            <Fabricquality />
          </ProtectedRoute>
        } />

        <Route path='/yarn' element={
          <ProtectedRoute currentUser={currentUser}>
            <YarnQuality />
          </ProtectedRoute>
        } />

        {/* Admin Only */}
        <Route path='/attendancerecord' element={
          <ProtectedRoute currentUser={currentUser}>
            {(currentUser?.role === 'admin' || currentUser?.role === 'site_developer') ? <AttendanceRecord /> : <Navigate to="/" />}
          </ProtectedRoute>
        } />

        <Route path='/productionreport' element={
          <ProtectedRoute currentUser={currentUser}>
            {(currentUser?.role === 'admin' || currentUser?.role === 'site_developer') ? <ProductionReport /> : <Navigate to="/" />}
          </ProtectedRoute>
        } />

        <Route path='/adminreport' element={
          <ProtectedRoute currentUser={currentUser}>
            <AdminReport currentUser={currentUser} />
          </ProtectedRoute>
        } />
        <Route path='/expense-chart' element={
          <ProtectedRoute currentUser={currentUser}>
            {(currentUser?.role === 'site_developer') ? <ExpenseChart /> : <Navigate to="/" />}
          </ProtectedRoute>
        } />
        <Route path='/yarn-purchase' element={
          <ProtectedRoute currentUser={currentUser}>
            {(currentUser?.role === 'admin' || currentUser?.role === 'site_developer') ? <YarnPurchaseForm /> : <Navigate to="/" />}
          </ProtectedRoute>
        } />
        <Route
          path="/yarn-purchase/edit/:id"
          element={
            <ProtectedRoute currentUser={currentUser}>
              <YarnPurchaseForm currentUser={currentUser} />
            </ProtectedRoute>
          }
        />
        <Route path='/yarn-report' element={
          <ProtectedRoute currentUser={currentUser}>
            {(currentUser?.role === 'admin' || currentUser?.role === 'site_developer') ? <YarnPurchaseReport /> : <Navigate to="/" />}
          </ProtectedRoute>
        } />

      </Routes>
    </div>
  );
}
const navStyle = (bgColor) => ({
  display: "inline-block",
  padding: "10px 18px",
  backgroundColor: bgColor,
  color: "#fff",
  textDecoration: "none",
  borderRadius: "6px",
  fontSize: "16px",
  fontWeight: "bold",
  transition: "0.3s"
});
export default App;