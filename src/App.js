import React from 'react';
import AttendancePage from './pages/AttendancePage';
import './App.css';
import AttendanceRecord from './pages/AttendanceRecord';
import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/attendance' element={<AttendancePage />}/>
        <Route path='/attendancerecord' element={<AttendanceRecord />}/>
      </Routes>
    </div>
  );
}

export default App;