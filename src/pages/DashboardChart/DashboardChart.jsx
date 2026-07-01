import React, { useEffect, useState } from "react";
import axios from "axios";
import Chart from "react-apexcharts";

const DashboardChart = () => {
  const [chartData, setChartData] = useState([]);
  const [viewType, setViewType] = useState("monthly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedMetrics, setSelectedMetrics] = useState(["totalProductionMeter"]);
  const [hoveredMetric, setHoveredMetric] = useState(null);

  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://kukadiya-textile.onrender.com";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fixed: Querying the single unified endpoint instead of hammering year-specific endpoints
      const res = await axios.get(`${API_BASE_URL}/api/production`);
      const allProductionData = res.data || {};
      let rows = [];

      // Safely navigate nested object keys: Year -> Month -> Date
      Object.keys(allProductionData).forEach((year) => {
        const yearObj = allProductionData[year] || {};
        Object.keys(yearObj).forEach((month) => {
          const monthObj = yearObj[month] || {};
          Object.keys(monthObj).forEach((date) => {
            const summary = monthObj[date]?.summary || {};
            rows.push({
              date,
              totalProductionMeter: Number(summary.total_production_meter || 0),
              totalPick: Number(summary.total_pick || 0),
              avgPick: Number(summary.total_average_pick || 0),
              mainMeter: Number(summary.main_meter || 0),
              compressorMeter: Number(summary.compressor_meter || 0),
            });
          });
        });
      });

      // Sort chronological order
      rows.sort((a, b) => {
        const [d1, m1, y1] = (a.date || "").split("-");
        const [d2, m2, y2] = (b.date || "").split("-");
        return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
      });

      const monthGroups = {};
      rows.forEach((row) => {
        const [, month, year] = (row.date || "").split("-");
        if (!month || !year) return;
        const key = `${month}-${year}`;
        if (!monthGroups[key]) monthGroups[key] = [];
        monthGroups[key].push(row);
      });

      let finalRows = [];
      Object.values(monthGroups).forEach((monthRows) => {
        monthRows.sort((a, b) => {
          const [d1, m1, y1] = a.date.split("-");
          const [d2, m2, y2] = b.date.split("-");
          return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
        });

        const totalMainUsed = monthRows.reduce((sum, row, index) => {
          if (index === 0) return sum;
          return sum + (Number(row.mainMeter || 0) - Number(monthRows[index - 1].mainMeter || 0));
        }, 0);

        const avgMainUsed = monthRows.length > 0 ? totalMainUsed / monthRows.length : 0;

        monthRows.forEach((row, index) => {
          const prev = monthRows[index - 1];
          const mainUsed = prev ? Number(row.mainMeter || 0) - Number(prev.mainMeter || 0) : 0;
          const compUsed = prev ? (Number(row.compressorMeter || 0) - Number(prev.compressorMeter || 0)) * 30 : 0;

          const pickChargePerUnit =
            row.totalPick > 0
              ? ((mainUsed > 0 ? mainUsed : avgMainUsed) / row.totalPick) * 7.9
              : 0;

          const pickChargeFixedCost =
            row.avgPick > 0 && row.totalProductionMeter > 0
              ? 41666 / (row.avgPick * row.totalProductionMeter)
              : 0;

          // Added strict fallback checking to completely lock out NaN values
          const finalPickChargePerUnit = isNaN(pickChargePerUnit) ? 0 : pickChargePerUnit;
          const finalPickCharge = isNaN(pickChargeFixedCost + pickChargePerUnit) ? 0 : (pickChargeFixedCost + pickChargePerUnit);

          finalRows.push({
            date: row.date,
            compressorMeter: isNaN(compUsed) ? 0 : Number(compUsed.toFixed(2)),
            mainMeter: isNaN(mainUsed) ? 0 : Number(mainUsed.toFixed(2)),
            totalProductionMeter: Number(row.totalProductionMeter || 0),
            totalPick: Number(row.totalPick || 0),
            pickChargePerUnit: Number(finalPickChargePerUnit.toFixed(4)), 
            pickCharge: Number(finalPickCharge.toFixed(4)), 
          });
        });
      });

      setChartData(finalRows);
    } catch (error) {
      console.error("API Fetch Error: ", error);
    }
  };

  const metricsConfig = {
    totalProductionMeter: { label: "Total Production Meter", color: "#4F46E5", bg: "#EEF2FF", border: "#C7D2FE" },
    totalPick:            { label: "Total Pick Run",         color: "#06B6D4", bg: "#ECFEFF", border: "#A5F3FC" },
    mainMeter:            { label: "Main Power Meter",       color: "#F59E0B", bg: "#FEF3C7", border: "#FDE68A" },
    compressorMeter:      { label: "Compressor Meter",       color: "#EF4444", bg: "#FEF2F2", border: "#FEE2E2" },
    pickChargePerUnit:    { label: "Pick Charge / Unit",     color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0" },
    pickCharge:           { label: "Pick Charge Total",      color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE" }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getFilteredData = () => {
    if (viewType === "monthly") {
      return chartData.filter((item) => {
        const [, month, year] = (item.date || "").split("-");
        return Number(month) === selectedMonth && Number(year) === selectedYear;
      });
    }

    if (viewType === "monthwise") {
      const grouped = {};
      chartData.forEach((item) => {
        const [, month, year] = (item.date || "").split("-");
        if (Number(year) !== selectedYear || !month) return;
        const labelKey = monthNames[Number(month) - 1]?.substring(0, 3) || "Unk";

        if (!grouped[labelKey]) {
          grouped[labelKey] = {
            date: labelKey, compressorMeter: 0, mainMeter: 0,
            totalProductionMeter: 0, totalPick: 0, pickChargePerUnit: 0,
            pickCharge: 0, count: 0
          };
        }
        grouped[labelKey].compressorMeter += item.compressorMeter;
        grouped[labelKey].mainMeter += item.mainMeter;
        grouped[labelKey].totalProductionMeter += item.totalProductionMeter;
        grouped[labelKey].totalPick += item.totalPick;
        grouped[labelKey].pickCharge += item.pickCharge;
        grouped[labelKey].pickChargePerUnit += item.pickChargePerUnit;
        grouped[labelKey].count += 1;
      });

      return Object.values(grouped).map((row) => ({
        ...row,
        compressorMeter: Number((row.compressorMeter || 0).toFixed(2)),
        mainMeter: Number((row.mainMeter || 0).toFixed(2)),
        pickChargePerUnit: row.count > 0 ? Number((row.pickChargePerUnit / row.count).toFixed(4)) : 0,
        pickCharge: row.count > 0 ? Number((row.pickCharge / row.count).toFixed(4)) : 0,
      }));
    }

    if (viewType === "yearly") {
      const grouped = {};
      chartData.forEach((item) => {
        const [, , year] = (item.date || "").split("-");
        if (!year) return;
        if (!grouped[year]) {
          grouped[year] = {
            date: year, compressorMeter: 0, mainMeter: 0,
            totalProductionMeter: 0, totalPick: 0, pickChargePerUnit: 0,
            pickCharge: 0, count: 0
          };
        }
        grouped[year].compressorMeter += item.compressorMeter;
        grouped[year].mainMeter += item.mainMeter;
        grouped[year].totalProductionMeter += item.totalProductionMeter;
        grouped[year].totalPick += item.totalPick;
        grouped[year].pickCharge += item.pickCharge;
        grouped[year].pickChargePerUnit += item.pickChargePerUnit;
        grouped[year].count += 1;
      });

      return Object.values(grouped).map((row) => ({
        ...row,
        compressorMeter: Number((row.compressorMeter || 0).toFixed(2)),
        mainMeter: Number((row.mainMeter || 0).toFixed(2)),
        pickChargePerUnit: row.count > 0 ? Number((row.pickChargePerUnit / row.count).toFixed(4)) : 0,
        pickCharge: row.count > 0 ? Number((row.pickCharge / row.count).toFixed(4)) : 0,
      }));
    }
    return chartData;
  };

  const filteredData = getFilteredData();

  const series = selectedMetrics.map((metric) => ({
    name: metricsConfig[metric]?.label || metric,
    data: filteredData.map((row) => row[metric] || 0),
  }));

  const activeColors = selectedMetrics.map((metric) => metricsConfig[metric]?.color || "#4F46E5");

  const options = {
    chart: {
      type: "area",
      fontFamily: "'Inter', system-ui, sans-serif",
      toolbar: { show: false },
    },
    colors: activeColors,
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        opacityFrom: 0.2,
        opacityTo: 0.01,
        stops: [0, 95, 100],
      },
    },
    markers: { size: 3, strokeWidth: 1.5, hover: { size: 5 } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: filteredData.map((row) => row.date || ""),
      labels: { style: { colors: "#64748B", fontSize: "11px", fontWeight: 500 } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        formatter: (value) => {
          if (isNaN(value) || value === null) return "0";
          return value % 1 !== 0 ? value.toFixed(4) : value.toLocaleString();
        },
        style: { colors: "#64748B", fontSize: "11px", fontWeight: 500 },
      },
    },
    grid: { borderColor: "#F1F5F9", strokeDashArray: 3 },
    legend: { position: "top", labels: { colors: "#334155" }, fontSize: "12px", fontWeight: 500 },
    tooltip: { 
      theme: "light",
      y: { formatter: (val) => (isNaN(val) || val === null) ? "0" : (val % 1 !== 0 ? val.toFixed(4) : val.toLocaleString()) }
    },
  };

  const handlePrint = () => window.print();

  // Guard values for valid fallback options inside the filter logic arrays
  const years = [...new Set(chartData.map((item) => {
    const parts = (item.date || "").split("-");
    return parts[2] ? Number(parts[2]) : null;
  }))].filter(Boolean).sort((a, b) => b - a);

  const styles = {
    mainWrapper: { padding: "20px", backgroundColor: "#F8FAFC", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" },
    brandContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FFFFFF", padding: "16px 20px", borderRadius: "12px", border: "1px solid #E2E8F0", marginBottom: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" },
    printBtn: { display: "flex", alignItems: "center", gap: "6px", height: "34px", padding: "0 14px", borderRadius: "6px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", color: "#334155", fontWeight: "600", fontSize: "12px", cursor: "pointer", transition: "all 0.1s ease" },
    controlPanel: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", backgroundColor: "#FFFFFF", padding: "12px 20px", borderRadius: "10px", border: "1px solid #E2E8F0", marginBottom: "16px" },
    activeTabs: { display: "flex", backgroundColor: "#F1F5F9", padding: "3px", borderRadius: "6px" },
    tabButton: (active) => ({ height: "28px", padding: "0 12px", borderRadius: "4px", border: "none", backgroundColor: active ? "#FFFFFF" : "transparent", color: active ? "#4F46E5" : "#475569", fontSize: "12px", fontWeight: "600", cursor: "pointer", boxShadow: active ? "0 1px 2px rgba(0,0,0,0.05)" : "none", transition: "all 0.1s" }),
    selectDropdown: { height: "34px", padding: "0 10px", borderRadius: "6px", border: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", color: "#1E293B", fontWeight: "500", fontSize: "12px", cursor: "pointer", outline: "none" },
    interactGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "10px", marginBottom: "16px" },
    chartBox: { backgroundColor: "#FFFFFF", padding: "16px 20px 8px 20px", borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 1px 2px rgba(0,0,0,0.01)" }
  };

  return (
    <div style={styles.mainWrapper}>
      <style>{`
        @media print {
          body * { visibility: hidden; background: transparent !important; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
        .metric-label-card { transition: all 0.1s ease; border: 1px solid #E2E8F0; background-color: #FFFFFF; color: #475569; }
        .metric-label-card:hover { transform: translateY(-1px); border-color: #CBD5E1; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .print-btn-action:hover { background-color: #F8FAFC !important; border-color: #94A3B8 !important; color: #0F172A !important; }
      `}</style>

      <div className="print-section">
        <div style={styles.brandContainer}>
          <div>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#0F172A", letterSpacing: "-0.3px" }}>
              Kukadiya Textile
            </h1>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748B" }}>
              Production Run Reporting Metrics
            </p>
          </div>
          <button style={styles.printBtn} onClick={handlePrint} className="no-print print-btn-action">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print
          </button>
        </div>

        <div style={styles.controlPanel} className="no-print">
          <div style={styles.activeTabs}>
            <button style={styles.tabButton(viewType === "monthly")} onClick={() => setViewType("monthly")}>Monthly Run</button>
            <button style={styles.tabButton(viewType === "monthwise")} onClick={() => setViewType("monthwise")}>Trends</button>
            <button style={styles.tabButton(viewType === "yearly")} onClick={() => setViewType("yearly")}>Yearly</button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {viewType === "monthly" && (
              <select style={styles.selectDropdown} value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                {monthNames.map((name, index) => (
                  <option key={index + 1} value={index + 1}>{name}</option>
                ))}
              </select>
            )}

            <select style={styles.selectDropdown} value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {years.length === 0 ? (
                <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
              ) : (
                years.map((year) => <option key={year} value={year}>{year}</option>)
              )}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: "8px" }} className="no-print">
          <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Select Metrics to Plot
          </span>
        </div>

        <div style={styles.interactGrid} className="no-print">
          {Object.entries(metricsConfig).map(([key, config]) => {
            const isChecked = selectedMetrics.includes(key);
            return (
              <label
                key={key}
                className="metric-label-card"
                onMouseEnter={() => setHoveredMetric(key)}
                onMouseLeave={() => setHoveredMetric(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  backgroundColor: isChecked ? config.bg : "#FFFFFF",
                  borderColor: isChecked ? config.border : "#E2E8F0",
                  color: isChecked ? config.color : "#475569",
                  cursor: "pointer",
                  userSelect: "none"
                }}
              >
                <input
                  type="checkbox"
                  style={{ 
                    accentColor: config.color, 
                    width: "14px", 
                    height: "14px",
                    transform: hoveredMetric === key ? "scale(1.05)" : "scale(1)",
                    transition: "transform 0.1s ease",
                    cursor: "pointer"
                  }}
                  checked={isChecked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMetrics([...selectedMetrics, key]);
                    } else {
                      setSelectedMetrics(selectedMetrics.filter((item) => item !== key));
                    }
                  }}
                />
                <span style={{ fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {config.label}
                </span>
              </label>
            );
          })}
        </div>

        <div style={styles.chartBox}>
          {filteredData.length === 0 ? (
            <div style={{ height: "400px", display: "flex", justifyContent: "center", alignItems: "center", color: "#94A3B8", fontSize: "12px" }}>
              No entries logged for this timeframe context.
            </div>
          ) : (
            <div style={{ width: "100%" }}>
              <Chart options={options} series={series} type="area" height={420} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DashboardChart;