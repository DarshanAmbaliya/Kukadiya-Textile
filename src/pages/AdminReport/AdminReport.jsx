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
  const calculateMeterUsage = (rows) => {
    return rows.map((current, index) => {
      const prev = rows[index - 1];

      const mainUsed = prev
        ? Number(current.main_meter || 0) - Number(prev.main_meter || 0)
        : 0;

      const compUsed = prev
        ? Number(current.compressor_meter || 0) - Number(prev.compressor_meter || 0)
        : 0;

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
      const res = await axios.get(`${API_URL}month?month=${year}-${month}`);
      const monthData = res.data;

      const rows = Object.keys(monthData || {})
        .sort((a, b) => Number(a.split("-")[0]) - Number(b.split("-")[0]))
        .map((date) => {
          const summary = monthData[date].summary || {};

          const avgPick = parseFloat(summary.total_average_pick || 0);
          const totalProduction = Number(summary.total_production_meter || 0);

          const pickCharge =
            avgPick > 0 && totalProduction > 0
              ? (58340 / (avgPick * totalProduction)).toFixed(2)
              : 0;

          const dayEff = parseFloat(summary.total_average_day_efficiency || 0);
          const nightEff = parseFloat(summary.total_average_night_efficiency || 0);
          const avgEfficiency = ((dayEff + nightEff) / 2).toFixed(2);

          return {
            date,
            avg_rpm: summary.total_average_rpm || 0,
            avg_efficiency: Number(avgEfficiency),
            avg_pick: avgPick,
            compressor_meter: Number(summary.compressor_meter || 0),
            main_meter: Number(summary.main_meter || 0),
            total_production_meter: totalProduction,
            pick_charge: Number(pickCharge),
          };
        });

      const rowsWithUsage = calculateMeterUsage(rows);
      setTableData(rowsWithUsage);
    } catch (error) {
      console.error(error);
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

  /* -------------------- UI -------------------- */
  return (
    <section className="production-report-section">
      <div className="container">
        <div className="row">
          <h2>Admin Production Report</h2>

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
                    AVG: {Number(avgCompUsed).toFixed(2)} <br/>TOTAL: {Number(totalCompUsed).toFixed(2)}
                  </td>
                  <td>
                    AVG: {Number(avgMainUsed).toFixed(2)} <br/>TOTAL: {Number(totalMainUsed).toFixed(2)}
                  </td>
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
