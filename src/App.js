import React from 'react';
import AttendancePage from './pages/AttendancePage';
import './App.css';
import AttendanceRecord from './pages/AttendanceRecord';
import { Route, Routes } from 'react-router-dom';
import Production from './pages/Production/Production';
import Fabricquality from './components/FabricQuality/Fabricquality';
import ProductionReport from './pages/ProductionReport/ProductionReport';
import AdminReport from './pages/AdminReport/AdminReport';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/attendance' element={<AttendancePage />}/>
        <Route path='/attendancerecord' element={<AttendanceRecord />}/>
        <Route path='/production' element={<Production />}/>
        <Route path='/fabric' element={<Fabricquality />}/>
        <Route path='/productionreport' element={<ProductionReport />}/>
        <Route path='/adminreport' element={<AdminReport />}/>
      </Routes>
    </div>
  );
}

export default App;