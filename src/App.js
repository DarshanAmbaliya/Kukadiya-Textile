import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useNavigate, NavLink } from 'react-router-dom';
import { UAParser } from 'ua-parser-js';
import bcrypt from "bcryptjs";
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

const getDeviceDetails = () => {
  const parser = new UAParser();
  const res = parser.getResult();
  const vendor = res.device.vendor || "";
  const model = res.device.model || "";
  const os = res.os.name || "";
  if (!vendor && !model) return `Desktop (${os})`;
  return `${vendor} ${model} (${os})`.trim();
};

const USERS_DB = [
  { username: 'admin', hash: '$2b$10$Wi5OE4ZlocW49O/8qDbbgOatoV5Nbn/ug9pTLJohPdkoS53PU5MI2', role: 'admin', name: 'Administrator' },
  { username: 'demo', hash: '$2b$10$P8.kmq08IebevVfYBV2HRuklURWXNBcKqqcub5PnWpYaYUA6iUSX2', role: 'demo', name: 'Manager' },
  { username: 'pushpa', hash: '$2b$10$Cm5gvq8M5UMg/E5c3xb0MObavpgU2f1TsFff2A84UM.7YbHsbvwwS', role: 'user', name: 'Staff' },
  { username: 'santosh', hash: '$2b$10$Psmc.ocZNxrl4JaPDdQlj.2p8w3xyL5bpCWjyvuzsKyF1/VbnWg3q', role: 'user', name: 'Staff' }
];

function App() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

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
    setLoading(false); // ✅ important
  }, []);

  // PASTE YOUR URL HERE
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxzYPp_rqBf-mXz30-N4zIZMXvRPJ8_L7mHiH9oC4U-GNjl5Ml2npGGm_uKNrnIXOb6/exec';

  // Function to send data to Sheet
  const logToSheet = (user, status) => {
    fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: user.username,
        role: user.role,
        device: user.device || getDeviceDetails(),
        login_time: new Date().toLocaleTimeString(),
        status: status // "Login" or "Logout"
      })
    });
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

  const handleLogin = (e) => {
    e.preventDefault();
    const userMatch = USERS_DB.find(
      (u) => u.username.toLowerCase() === credentials.username.toLowerCase() &&
        bcrypt.compareSync(credentials.password, u.hash)
    );

    if (userMatch) {
      const deviceInfo = getDeviceDetails();
      const today = new Date().toLocaleDateString();
      const sessionData = { ...userMatch, device: deviceInfo, loginDate: today };

      // SEND LOGIN STATUS
      logToSheet(sessionData, "Login");

      setCurrentUser(sessionData);
      localStorage.setItem('authUser', JSON.stringify(sessionData));
      setError('');
      navigate('/');
    } else {
      setError('Invalid username or password');
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
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <div style={{ display: 'inline-block', padding: '30px', border: '1px solid #ddd', borderRadius: '10px' }}>
            <h2>System Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Username"
                onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                required
              />
              <button type="submit">Login</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>
        </div>
      )}

      <Routes>
        {/* Public Route */}
        <Route path='/' element={<Homepage currentUser={currentUser} />} />

        {/* Protected Routes (Login Required) */}
        <Route path='/attendance' element={
          <ProtectedRoute currentUser={currentUser}>
            <AttendancePage currentUser={currentUser} />
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
            {currentUser?.role === 'admin' ? <AttendanceRecord /> : <Navigate to="/" />}
          </ProtectedRoute>
        } />

        <Route path='/productionreport' element={
          <ProtectedRoute currentUser={currentUser}>
            {currentUser?.role === 'admin' ? <ProductionReport /> : <Navigate to="/" />}
          </ProtectedRoute>
        } />

        <Route path='/adminreport' element={
          <ProtectedRoute currentUser={currentUser}>
            <AdminReport currentUser={currentUser} />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;