import React, { useState, useEffect } from "react";
import axios from "axios";
import { getDaysInMonth, createEmployee, PRINT_STYLE } from "../utils/payrollHelpers";
import SalarySlip from "../components/SalarySlip";
import AdvanceInput from "../components/AdvanceInput";

const API_URL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL
    : "http://localhost:5000";

export default function AttendancePage() {
  // displayDate controls the Year and Month currently on screen
  const [displayDate, setDisplayDate] = useState({ year: 2026, monthName: "January", monthIdx: 0 });
  const days = getDaysInMonth(displayDate.year, displayDate.monthIdx);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingEmp, setViewingEmp] = useState(null);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpRate, setNewEmpRate] = useState(750);
  
  const [selectedMonthForNew, setSelectedMonthForNew] = useState("");
  const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  const availableYears = [2025, 2026, 2027, 2028, 2029, 2030];

  // FETCH DATA: Runs whenever the year or month view is changed
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get("https://mahakali-textiles-production.up.railway.app/api/employees");
        const yearData = res.data[displayDate.year];
        const monthKey = displayDate.monthName.toLowerCase();
        
        if (yearData && yearData[monthKey]) {
          setEmployees(yearData[monthKey]);
        } else {
          setEmployees([]); // Shows empty if the year/month hasn't been initialized
        }
        setLoading(false);
      } catch (err) {
        console.error("Connection Refused!", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [displayDate.year, displayDate.monthName]);

  const syncToDB = async (updatedList) => {
    try {
      await axios.post(API_URL, {
        year: displayDate.year,
        month: displayDate.monthName.toLowerCase(),
        employees: updatedList
      });
    } catch (err) {
      console.error("Sync failed", err);
    }
  };

  // --- 1. SAFE VIEW CHANGE (Does not affect data) ---
  const handleViewChange = (field, value) => {
    if (field === "year") {
      setDisplayDate(prev => ({ ...prev, year: parseInt(value) }));
    } else {
      const mIdx = monthNames.indexOf(value.toLowerCase());
      setDisplayDate(prev => ({ 
        ...prev, 
        monthName: value.charAt(0).toUpperCase() + value.slice(1), 
        monthIdx: mIdx 
      }));
    }
  };

  // --- 2. INITIALIZE NEW MONTH/YEAR (Carry names, clear data) ---
  const handleInitializeMonth = async () => {
    if (!selectedMonthForNew) return alert("Please select a month!");

    const confirmMsg = `Initialize ${selectedMonthForNew.toUpperCase()} ${displayDate.year}? This carries over names but clears attendance.`;
    if (!window.confirm(confirmMsg)) return;

    const newMonthIdx = monthNames.indexOf(selectedMonthForNew.toLowerCase());
    const newDays = getDaysInMonth(displayDate.year, newMonthIdx);

    const freshData = employees.map(emp => ({
      name: emp.name,
      dailySalary: emp.dailySalary,
      attendance: new Array(newDays).fill(""), 
      advance: [],
      totalPresent: 0,
      totalAbsent: 0,
      totalSalary: 0,
      totalAdvance: 0,
      finalPay: 0
    }));

    try {
      await axios.post(API_URL, {
        year: displayDate.year,
        month: selectedMonthForNew.toLowerCase(),
        employees: freshData
      });

      // After API success, move the view to that month
      setDisplayDate(prev => ({ 
        ...prev, 
        monthName: selectedMonthForNew.charAt(0).toUpperCase() + selectedMonthForNew.slice(1), 
        monthIdx: newMonthIdx 
      }));
      setEmployees(freshData);
      setSelectedMonthForNew("");
      alert(`Success! ${selectedMonthForNew.toUpperCase()} ${displayDate.year} is now ready.`);
    } catch (err) {
      alert("Error: Database could not be updated.");
    }
  };

  const updateField = async (id, field, value) => {
    const updatedList = employees.map(emp => {
      if (emp._id !== id && emp.id !== id) return emp;
      let updatedEmp = { ...emp, [field]: value };
      if (['attendance', 'dailySalary', 'advance'].includes(field)) {
        const presentCount = updatedEmp.attendance.filter(x => x === "P").length;
        const absentCount = updatedEmp.attendance.filter(x => x === "A").length;
        updatedEmp.totalPresent = presentCount;
        updatedEmp.totalAbsent = absentCount;
        updatedEmp.totalSalary = presentCount * updatedEmp.dailySalary;
        updatedEmp.totalAdvance = updatedEmp.advance.reduce((acc, obj) => acc + Number(Object.values(obj)[0]), 0);
        updatedEmp.finalPay = updatedEmp.totalSalary - updatedEmp.totalAdvance;
      }
      return updatedEmp;
    });
    setEmployees(updatedList);
    await syncToDB(updatedList);
  };

  const addNewEmployee = async () => {
    if (!newEmpName.trim()) return;
    const newEmp = createEmployee(Date.now(), newEmpName, days, newEmpRate);
    const updatedList = [...employees, newEmp];
    setEmployees(updatedList);
    await syncToDB(updatedList);
    setNewEmpName("");
  };

  const deleteEmployee = async (id) => {
    if (window.confirm("Delete employee?")) {
      const updatedList = employees.filter(e => (e._id || e.id) !== id);
      setEmployees(updatedList);
      await syncToDB(updatedList);
    }
  };

  const printSlip = (id) => {
    const content = document.getElementById(`slip-${id}`).innerHTML;
    const w = window.open("", "_blank");
    w.document.write(`<html><head><style>${PRINT_STYLE}</style></head><body>${content}</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 500);
  };

  if (loading) return <div className="loader">Loading {displayDate.monthName} {displayDate.year}...</div>;

  return (
    <div className="container">
      <header className="app-header">
        <div className="title-area">
          <h1 style={{ margin: 0 }}>Payroll: {displayDate.monthName} {displayDate.year}</h1>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            {/* VIEW NAVIGATION (SAFE) */}
            <select value={displayDate.year} onChange={(e) => handleViewChange("year", e.target.value)}>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={displayDate.monthName.toLowerCase()} onChange={(e) => handleViewChange("month", e.target.value)}>
              {monthNames.map(m => <option key={m} value={m}>VIEW {m.toUpperCase()}</option>)}
            </select>
          </div>
        </div>

        <div className="header-actions">
          {/* Add Employee Form */}
          <div className="add-emp-box">
            <input placeholder="Name" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} />
            <input type="number" style={{ width: '70px' }} value={newEmpRate} onChange={e => setNewEmpRate(e.target.value)} />
            <button className="add-emp-btn" onClick={addNewEmployee}>+ Add</button>
          </div>

          {/* INITIALIZE NEW MONTH/YEAR (ACTION) */}
          <div className="month-create-box" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>START NEW MONTH:</span>
            <select value={selectedMonthForNew} onChange={(e) => setSelectedMonthForNew(e.target.value)}>
              <option value="">Month</option>
              {monthNames.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
            </select>
            <button className="add-emp-btn" onClick={handleInitializeMonth} style={{ background: '#0284c7' }}>
              Initialize
            </button>
          </div>
        </div>
      </header>

      <div className="table-wrapper">
        <table className="main-table">
          <thead>
            <tr>
              <th className="sticky-col">Employee Name</th>
              <th>Rate</th>
              {Array.from({ length: days }, (_, i) => <th key={i}>{i + 1}</th>)}
              <th style={{ color: "#2ecc71" }}>P</th>
              <th style={{ color: "#e74c3c" }}>A</th>
              <th>Earnings</th>
              <th style={{ minWidth: '250px' }}>Advances</th>
              <th>Net Pay</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map(emp => (
                <tr key={emp._id || emp.id}>
                  <td className="sticky-col">
                    <input type="text" value={emp.name} onChange={e => updateField(emp._id || emp.id, 'name', e.target.value)} style={{ border: 'none', background: 'transparent', fontWeight: 'bold', width: '100%' }} />
                  </td>
                  <td>
                    <input type="number" className="rate-input" value={emp.dailySalary} onChange={e => updateField(emp._id || emp.id, 'dailySalary', Number(e.target.value))} />
                  </td>
                  {emp.attendance.map((v, i) => (
                    <td key={i} className={`att-cell ${v === "P" ? "p-bg" : v === "A" ? "a-bg" : ""}`}>
                      <select value={v} onChange={e => {
                        const newAtt = [...emp.attendance];
                        newAtt[i] = e.target.value;
                        updateField(emp._id || emp.id, 'attendance', newAtt);
                      }}>
                        <option value="">-</option><option value="P">P</option><option value="A">A</option>
                      </select>
                    </td>
                  ))}
                  <td className="stats-cell text-p">{emp.totalPresent}</td>
                  <td className="stats-cell text-a">{emp.totalAbsent || 0}</td>
                  <td>₹{emp.totalSalary}</td>
                  <td>
                    <AdvanceInput onAdd={(d, a) => {
                      const newAdv = [...emp.advance, { [d]: Number(a) }];
                      updateField(emp._id || emp.id, 'advance', newAdv);
                    }} />
                    <div className="adv-grid">
                      {emp.advance.map((obj, idx) => (
                        <div key={idx} className="adv-tag">
                          <span>{Object.keys(obj)[0]}: ₹{Object.values(obj)[0]}</span>
                          <button onClick={() => {/* Delete Advance logic */}}>&times;</button>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="money-text highlight">₹{emp.finalPay}</td>
                  <td className="action-cell">
                    <button className="view-btn" onClick={() => setViewingEmp(emp)}>View</button>
                    <button className="trash-btn" onClick={() => deleteEmployee(emp._id || emp.id)}>🗑️</button>
                    <div id={`slip-${emp._id || emp.id}`} style={{ display: "none" }}>
                      <SalarySlip emp={emp} month={displayDate.monthName} year={displayDate.year} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={days + 8} style={{ padding: '60px', textAlign: 'center' }}>No data for {displayDate.monthName} {displayDate.year}. Select month and click "Initialize" to start.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {viewingEmp && (
        <div className="modal-overlay" onClick={() => setViewingEmp(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <SalarySlip emp={viewingEmp} month={displayDate.monthName} year={displayDate.year} />
            <button className="add-emp-btn" onClick={() => printSlip(viewingEmp._id || viewingEmp.id)}>🖨️ Print Slip</button>
          </div>
        </div>
      )}
    </div>
  );
}