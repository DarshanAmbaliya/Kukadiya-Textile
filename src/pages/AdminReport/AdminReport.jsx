import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminReport = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [tableData, setTableData] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://mahakali-textiles.onrender.com";

  const API_URL = `${API_BASE_URL}/api/production/`;

  /* -------------------- HELPER: CALCULATE METER USAGE -------------------- */
  /* -------------------- HELPER: CALCULATE METER USAGE -------------------- */
  const calculateMeterUsage = (rows) => {
    return rows.map((current, index) => {
      const prev = rows[index - 1];

      // If it's the first entry in the list, we don't have a previous day to subtract
      if (!prev) {
        return {
          ...current,
          main_meter_used: 0,
          compressor_meter_used: 0,
        };
      }

      // Calculation: (Current Meter - Previous Meter) * 30
      const mainUsed = (Number(current.main_meter || 0) - Number(prev.main_meter || 0)) * 30;
      const compUsed = (Number(current.compressor_meter || 0) - Number(prev.compressor_meter || 0)) * 30;

      return {
        ...current,
        main_meter_used: mainUsed,
        compressor_meter_used: compUsed,
      };
    });
  };

  /* -------------------- FETCH DATA -------------------- */
  useEffect(() => {
    fetchData();
  }, [year, month]);

  const fetchData = async () => {
    try {
      // 1. Calculate the previous month to get the "Closing Balance"
      const prevMonthDate = new Date(year, parseInt(month) - 2, 1);
      const prevYear = prevMonthDate.getFullYear();
      const prevMonthStr = (prevMonthDate.getMonth() + 1).toString().padStart(2, "0");

      // 2. Fetch both Current and Previous Month data simultaneously
      const [currentRes, prevRes] = await Promise.all([
        axios.get(`${API_URL}month?month=${year}-${month}`),
        axios.get(`${API_URL}month?month=${prevYear}-${prevMonthStr}`)
      ]);

      const combinedData = { ...(prevRes.data || {}), ...(currentRes.data || {}) };

      // 3. Process all data into a sorted array by Date object
      const allRows = Object.keys(combinedData)
        .sort((a, b) => {
          const [d1, m1, y1] = a.split("-");
          const [d2, m2, y2] = b.split("-");
          return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
        })
        .map((date) => {
          const summary = combinedData[date].summary || {};
          const avgPick = parseFloat(summary.total_average_pick || 0);
          const totalProduction = Number(summary.total_production_meter || 0);

          // Pick Charge Logic
          const pickCharge = (avgPick > 0 && totalProduction > 0)
            ? (58340 / (avgPick * totalProduction)).toFixed(2)
            : 0;

          return {
            date,
            main_meter: Number(summary.main_meter || 0),
            compressor_meter: Number(summary.compressor_meter || 0),
            avg_rpm: summary.total_average_rpm || 0,
            avg_efficiency: Number(((parseFloat(summary.total_average_day_efficiency || 0) +
              parseFloat(summary.total_average_night_efficiency || 0)) / 2).toFixed(2)),
            avg_pick: avgPick,
            total_lost_meter: Number(summary.total_lost_meter || 0),
            total_production_meter: totalProduction,
            pick_charge: Number(pickCharge),
          };
        });

      // 4. APPLY FORMULAS: 
      // Compressor = (Current - Prev) * 30
      // Main Meter = (Current - Prev)
      const calculatedRows = allRows.map((current, index) => {
        const prev = allRows[index - 1];
        if (!prev) return { ...current, main_meter_used: 0, compressor_meter_used: 0 };

        return {
          ...current,
          main_meter_used: current.main_meter - prev.main_meter,
          compressor_meter_used: (current.compressor_meter - prev.compressor_meter) * 30,
        };
      });

      // 5. FILTER: Keep only the days belonging to the SELECTED month/year
      const finalData = calculatedRows.filter(row => row.date.includes(`-${month}-${year}`));
      setTableData(finalData);

    } catch (error) {
      console.error("Error fetching data:", error);
      setTableData([]);
    }
  };

  /* -------------------- FILTER LOGIC -------------------- */
  const filteredData = tableData.filter((row) => {
    if (!startDate && !endDate) return true;

    const day = parseInt(row.date.split("-")[0]);
    const startDay = startDate ? parseInt(startDate.split("-")[2]) : 0;
    const endDay = endDate ? parseInt(endDate.split("-")[2]) : 32;

    return day >= startDay && day <= endDay;
  });

  const count = filteredData.length;

  /* -------------------- FOOTER CALCULATIONS -------------------- */
  const avgRPM =
    count > 0
      ? (
        filteredData.reduce((sum, r) => sum + Number(r.avg_rpm || 0), 0) /
        count
      ).toFixed(2)
      : 0;

  const avgEfficiencyTotal =
    count > 0
      ? (
        filteredData.reduce((sum, r) => sum + Number(r.avg_efficiency || 0), 0) /
        count
      ).toFixed(2)
      : 0;

  const avgPick =
    count > 0
      ? (
        filteredData.reduce((sum, r) => sum + Number(r.avg_pick || 0), 0) /
        count
      ).toFixed(2)
      : 0;

  const totalCompressor =
    filteredData.reduce(
      (sum, r) => sum + Number(r.compressor_meter || 0),
      0
    );

  const totalMainMeter =
    filteredData.reduce((sum, r) => sum + Number(r.main_meter || 0), 0);

  const totalProduction =
    filteredData.reduce(
      (sum, r) => sum + Number(r.total_production_meter || 0),
      0
    );

  const avgPickCharge =
    count > 0
      ? (
        filteredData.reduce((sum, r) => sum + Number(r.pick_charge || 0), 0) /
        count
      ).toFixed(2)
      : 0;

  const totalMainUsed =
    filteredData.reduce(
      (sum, r) => sum + Number(r.main_meter_used || 0),
      0
    );

  const totalCompUsed =
    filteredData.reduce(
      (sum, r) => sum + Number(r.compressor_meter_used || 0),
      0
    );

  const avgMainUsed =
    count > 0
      ? (totalMainUsed / count).toFixed(2)
      : 0;

  const avgCompUsed =
    count > 0
      ? (totalCompUsed / count).toFixed(2)
      : 0;

  const totalLostMeter = filteredData.reduce((sum, r) => sum + Number(r.total_lost_meter || 0), 0);
  const formatWithSign = (num) => {
    const value = Number(num);
    if (value > 0) return `+${value.toFixed(2)}`;
    if (value < 0) return `${value.toFixed(2)}`; // Minus is automatic
    return "0.00";
  };

  const handlePrint = () => {
    window.print();
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  /* -------------------- UI -------------------- */
  return (
    <section className="production-report-section">
      <style>
        {`
          @media print {
            @page {
              size: portrait;
              margin: 8mm; /* Smaller margins to give more space to the table */
            }
            .title {
              display: block !important;
              border: 0 !important;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            /* Hide UI elements */.subtitle, .print-btn, button ,.app-header{
              display: none !important;
            }
            .title {
              text-align: center !important;
              font-size: 18pt !important;
              margin-bottom: 15px !important;
              text-transform: uppercase;
              border-bottom: 1px solid #000;
              padding-bottom: 5px;
            }
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              table-layout: auto; /* Allow columns to shrink to content */
            }
            th, td {
              border: 0.5pt solid #000 !important; /* Thinner lines look cleaner in Portrait */
              padding: 4px 2px !important; /* Very tight padding for narrow columns */
              font-size: 8pt !important; /* Smaller font to ensure 9 columns fit */
              text-align: center !important;
            }
            thead {
              display: table-header-group;
              background-color: #f0f0f0 !important;
            }
            /* Ensure the Lost Meter colors print clearly */
            .loss-pos { color: #d32f2f !important; font-weight: bold; }
            .loss-neg { color: #2e7d32 !important; font-weight: bold; }
          }
        `}
      </style>
      <div className="container">
        <div className="row">
          <h2 className="title" style={{ textAlign: "center", marginBottom: "20px" }}>
            Mahakali Textiles - {monthNames[parseInt(month) - 1]} {year}
          </h2>
          <h2 className="subtitle">Admin Production Report
            <button
              className="print-btn"
              onClick={handlePrint}
              style={{ padding: "8px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >Print Report</button>
          </h2>

          <div className="filter-controls" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {/* Year Selector */}
            <div className="filter-menu">
              <label><strong>Year: </strong></label>
              <select
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  setStartDate("");
                  setEndDate("");
                }}
              >
                {Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Month Selector */}
            <div className="filter-menu">
              <label><strong>Month: </strong></label>
              <select
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  setStartDate("");
                  setEndDate("");
                }}
              >
                {[
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ].map((m, idx) => (
                  <option key={m} value={(idx + 1).toString().padStart(2, '0')}>{m}</option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div className="filter-menu">
              <label><strong>From Date: </strong></label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate && e.target.value > endDate) setEndDate("");
                }}
              />
            </div>

            {/* To Date */}
            <div className="filter-menu">
              <label><strong>To Date: </strong></label>
              <input
                type="date"
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Clear Filters */}
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="production-data" style={{ overflowX: "auto" }}>
            <table
              border="1"
              cellPadding="10"
              style={{
                marginTop: "20px",
                borderCollapse: "collapse",
                width: "100%",
                textAlign: "center",
              }}
            >
              <thead style={{ background: "#eee" }}>
                <tr>
                  <th>Date</th>
                  <th>Avg RPM</th>
                  <th>Avg Efficiency</th>
                  <th>Avg Pick</th>
                  <th>Compressor Meter</th>
                  <th>Main Meter</th>
                  <th>Total Lost Meter</th>
                  <th>Total Production Meter</th>
                  <th>Pick Charge</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <tr key={row.date}>
                      <td>{row.date}</td>
                      <td>{row.avg_rpm}</td>
                      <td>{row.avg_efficiency}</td>
                      <td>{row.avg_pick}</td>
                      <td>{Number(row.compressor_meter_used).toFixed(2)}</td>
                      <td>{Number(row.main_meter_used).toFixed(2)}</td>
                      <td style={{
                        color: row.total_lost_meter > 0 ? "#2e7d32" : row.total_lost_meter < 0 ? "red" : "black"
                      }}>
                        {formatWithSign(row.total_lost_meter)}
                      </td>
                      <td>{row.total_production_meter}</td>
                      <td>{row.pick_charge}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No data found for selected range.</td>
                  </tr>
                )}
              </tbody>

              <tfoot style={{ background: "#e9ecef", fontWeight: "bold" }}>
                <tr>
                  <td>TOTAL / AVG</td>
                  <td>{avgRPM}</td>
                  <td>{avgEfficiencyTotal} %</td>
                  <td>{avgPick}</td>
                  <td>
                    AVG: {Number(avgCompUsed).toFixed(2)} <br />TOTAL: {Number(totalCompUsed).toFixed(2)}
                  </td>
                  <td>
                    AVG: {Number(avgMainUsed).toFixed(2)} <br />TOTAL: {Number(totalMainUsed).toFixed(2)}
                  </td>
                  <td style={{
                    color: totalLostMeter > 0 ? "#2e7d32" : totalLostMeter < 0 ? "red" : "black"
                  }}>{formatWithSign(totalLostMeter)}</td>
                  <td>{totalProduction}</td>
                  <td>{avgPickCharge}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminReport;
