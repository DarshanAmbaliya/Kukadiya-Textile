import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

const ExpenseReport = () => {
  const currentYear = new Date().getFullYear().toString();
  const currentMonthNum = (new Date().getMonth() + 1).toString(); // "1" - "12"

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonthNum); // Updated: Starts at current month instead of ""
  const [reportData, setReportData] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [isMonthlyView, setIsMonthlyView] = useState(false);
  
  // A safety flag to prevent endless loops if the whole year is completely empty
  const [hasCheckedFallback, setHasCheckedFallback] = useState(false);

  const navigate = useNavigate(); 
  const [categories, setCategories] = useState([]);

  const API_BASE_URL = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://mahakali-textiles.onrender.com";

  const monthNames = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  // Updated: Added dependencies to handle changes and auto-scans cleanly
  useEffect(() => {
    fetchReport();
  }, [year, month, hasCheckedFallback]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/expenses/categories`);
      if (res.data.success) setCategories(res.data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchReport = async () => {
    try {
      if (month) {
        const res = await axios.get(
          `${API_BASE_URL}/api/expenses/monthly?year=${year}&month=${month}`
        );
        
        if (res.data.success) {
          // --- NEW FALLBACK LOGIC ---
          // If no expenses are found, and we haven't tried fallback rules yet, check the previous month
          if (res.data.data.length === 0 && !hasCheckedFallback) {
            let prevMonth = parseInt(month) - 1;
            let targetYear = parseInt(year);

            if (prevMonth === 0) {
              prevMonth = 12;
              targetYear -= 1; // Drop to December of last year
            }

            setHasCheckedFallback(true); // Flag true so we only jump back once
            setYear(String(targetYear));
            setMonth(String(prevMonth));
            return; // Exit execution early to allow state refresh triggers to rerun fetchReport
          }

          setReportData(res.data.data);
          setGrandTotal(res.data.totalExpense);
          setIsMonthlyView(true);
        }
      } else {
        // --- YEARLY SUMMARY CODE BLOCK ---
        const promises = [];
        for (let m = 1; m <= 12; m++) {
          promises.push(
            axios.get(`${API_BASE_URL}/api/expenses/monthly?year=${year}&month=${m}`)
          );
        }

        const responses = await Promise.all(promises);
        let annualTotal = 0;
        const compiledMonths = responses.map((res, index) => {
          const monthNum = index + 1;
          const monthTotal = res.data.success ? res.data.totalExpense : 0;
          annualTotal += monthTotal;

          return {
            monthNumber: monthNum,
            monthName: monthNames[monthNum],
            totalExpense: monthTotal
          };
        });

        setReportData(compiledMonths);
        setGrandTotal(annualTotal);
        setIsMonthlyView(false);
      }
    } catch (err) {
      console.error("Error creating expense report matrix:", err);
      setReportData([]);
      setGrandTotal(0);
    }
  };

  // Reset the fallback protection whenever manual drop-down selection events occur
  const handleMonthChange = (e) => {
    setHasCheckedFallback(true); // Disables auto-jumping when selecting manually
    setMonth(e.target.value);
  };

  const handleYearChange = (e) => {
    setHasCheckedFallback(true); 
    setYear(e.target.value);
  };

  const handleNavigateToAddExpense = () => {
    const targetMonth = month ? month.padStart(2, "0") : String(new Date().getMonth() + 1).padStart(2, "0");
    const targetYear = year;
    navigate(`/expense?year=${targetYear}&month=${targetMonth}`);
  };

  const handlePrint = () => {
    const printContent = document.getElementById("expense-report").innerHTML;
    const iframe = document.createElement("iframe");
    
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`<html><head><title>Print</title></head><body>${printContent}</body></html>`);
    doc.close();
    
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    
    setTimeout(() => document.body.removeChild(iframe), 500);
  };

  return (
    <section className="production-report-section" id="expense-report">
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .production-report-section {
            padding: 0 !important;
            margin: 0 !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #333 !important;
          }
        }
      `}</style>

      <div className="container">
        <div className="row">
          <h2>Expense Analysis Report</h2>

          {/* --- FILTER & ACTION CONTROL ROW --- */}
          <div className="filter-controls" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>

            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              {/* Year Selector */}
              <div className="filter-menu">
                <label><strong>Select Year: </strong></label>
                <select value={year} onChange={handleYearChange}>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>

              {/* Month Selector */}
              <div className="filter-menu">
                <label><strong>Select Month: </strong></label>
                <select value={month} onChange={handleMonthChange}>
                  <option value="">All Months (Yearly Summary)</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
            </div>

            {/* Action Buttons Container */}
            <div className="no-print" style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handlePrint}
                style={{
                  background: "#3498db",
                  color: "#ffffff",
                  border: "none",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "600",
                  borderRadius: "4px",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                Print Report
              </button>

              <button
                onClick={handleNavigateToAddExpense}
                style={{
                  background: "#28a745",
                  color: "#ffffff",
                  border: "none",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "600",
                  borderRadius: "4px",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                + Add Expense
              </button>
            </div>
          </div>

          {/* --- DATA VISUALIZATION TABLE --- */}
          <div className="production-data" style={{ overflowX: "auto", marginTop: "20px" }}>
            <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%", textAlign: "center" }}>
              <thead style={{ background: "#eee" }}>
                {isMonthlyView ? (
                  <tr>
                    <th>Sr No.</th>
                    <th>Expense Name</th>
                    <th>Notes / Vouchers</th>
                    <th>Amount (₹)</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Month Code</th>
                    <th>Month Name</th>
                    <th>Total Expenses (₹)</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {reportData.length > 0 ? (
                  reportData.map((row, index) => (
                    isMonthlyView ? (
                      <tr key={row._id || index}>
                        <td>{index + 1}</td>
                        <td style={{ fontWeight: "500" }}>{row.name}</td>
                        <td style={{ fontStyle: "italic", color: "#666" }}>{row.notes || "—"}</td>
                        <td style={{ textAlign: "right", paddingRight: "40px",fontWeight: "700" }}>
                          {row.amount.toLocaleString("en-IN")}/-
                        </td>
                      </tr>
                    ) : (
                      <tr 
                        key={row.monthNumber}
                        onClick={() => { setHasCheckedFallback(true); setMonth(String(row.monthNumber)); }} 
                        title={`Click to filter view for ${row.monthName}`}
                        style={{ cursor: "pointer" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <td>{row.monthNumber}</td>
                        <td style={{ fontWeight: "500", color: "#007bff", textDecoration: "underline" }}>
                          {row.monthName}
                        </td>
                        <td style={{ textAlign: "right", paddingRight: "40px" }}>
                          {row.totalExpense > 0 ? `${row.totalExpense.toLocaleString("en-IN")}/-` : "0/-"}
                        </td>
                      </tr>
                    )
                  ))
                ) : (
                  <tr>
                    <td colSpan={isMonthlyView ? "4" : "3"}>No records discovered for specified criteria.</td>
                  </tr>
                )}
              </tbody>
              <tfoot style={{ background: "#e9ecef", fontWeight: "bold" }}>
                <tr>
                  <td colSpan={isMonthlyView ? "3" : "2"} style={{ textAlign: "right", paddingRight: "20px" }}>
                    {isMonthlyView ? "Total Month Expense:" : `Grand Total for ${year}:`}
                  </td>
                  <td style={{ textAlign: "right", paddingRight: "40px" }}>
                    {grandTotal.toLocaleString("en-IN")}/-
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpenseReport;