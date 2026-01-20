import React, { useEffect, useState } from 'react';
import AttendancePage from './pages/AttendancePage';
import './App.css';
import AttendanceRecord from './pages/AttendanceRecord';
import { Route, Routes } from 'react-router-dom';
import Production from './pages/Production/Production';
import Fabricquality from './components/FabricQuality/Fabricquality';
import ProductionReport from './pages/ProductionReport/ProductionReport';
import AdminReport from './pages/AdminReport/AdminReport';


// A simple hashing function (not cryptographically secure, but hides plain text)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return hash;
}

// Store the "hashed password" here instead of plain text
const PASSWORD_HASH = simpleHash('m@0101');

function App() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');

   // Check sessionStorage on load
   useEffect(() => {
    const auth = sessionStorage.getItem('authenticated');
    if (auth === 'true') {
      setAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (simpleHash(password) === PASSWORD_HASH) {
      setAuthenticated(true);
      sessionStorage.setItem('authenticated', 'true'); // session-based
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    sessionStorage.removeItem('authenticated'); // clear session
    setPassword('');
  };

  if (!authenticated) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Enter Password</h2>
        <form onSubmit={handlePasswordSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button type="submit">Submit</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        <Route path='/attendance' element={<AttendancePage />} />
        <Route path='/attendancerecord' element={<AttendanceRecord />} />
        <Route path='/production' element={<Production />} />
        <Route path='/fabric' element={<Fabricquality />} />
        <Route path='/productionreport' element={<ProductionReport />} />
        <Route path='/adminreport' element={<AdminReport />} />
      </Routes>
    </div>
  );
}

export default App;