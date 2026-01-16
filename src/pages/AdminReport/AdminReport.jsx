import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminReport = () => {
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonthStr);
  const [tableData, setTableData] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://mahakali-textiles-production.up.railway.app";

  const API_URL = `${API_BASE_URL}/api/production/`;

  useEffect(() => {
    fetchData();
  }, [month]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}month?month=${month}`);
      const monthData = res.data;

      const rows = Object.keys(monthData)
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
            compressor_meter: summary.compressor_meter || 0,
            main_meter: summary.main_meter || 0,
            total_production_meter: totalProduction,
            pick_charge: Number(pickCharge),
          };
        });

      setTableData(rows);
    } catch (error) {
      console.error(error);
      setTableData([]);
    }
  };

  // ---- FILTER LOGIC ----
  const filteredData = tableData.filter((row) => {
    if (!startDate && !endDate) return true;

    const day = parseInt(row.date.split("-")[0]);
    const startDay = startDate ? parseInt(startDate.split("-")[2]) : 0;
    const endDay = endDate ? parseInt(endDate.split("-")[2]) : 32;

    return day >= startDay && day <= endDay;
  });

  const count = filteredData.length;

  // ---- FOOTER CALCULATIONS ----
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

  return (
    <section className="production-report-section">
      <div className="container">
        <div className="row">
          <h2>Admin Production Report</h2>

          <div className="filter-controls">
            <div className="filter-menu">
              <label><strong>Month: </strong></label>
              <input
                type="month"
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  setStartDate("");
                  setEndDate("");
                }}
              />
            </div>

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

            <div className="filter-menu">
              <label><strong>To Date: </strong></label>
              <input
                type="date"
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

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
                  <th>Avg Efficiency</th> {/* NEW */}
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
                      <td>{row.avg_efficiency}</td> {/* NEW */}
                      <td>{row.avg_pick}</td>
                      <td>{row.compressor_meter}</td>
                      <td>{row.main_meter}</td>
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
                  <td>-</td>
                  <td>-</td>
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
