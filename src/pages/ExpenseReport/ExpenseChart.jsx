import React, { useEffect, useState } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import { useNavigate } from "react-router-dom";

const ExpenseCharts = () => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Filter States
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(""); 
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Data States
  const [categories, setCategories] = useState([]);
  const [rawMonthlyData, setRawMonthlyData] = useState([]); 
  const [singleMonthData, setSingleMonthData] = useState([]); 
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const API_BASE_URL = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://mahakali-textiles.onrender.com";

  const monthNames = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Professional Global Apex Chart Style Definitions
  const baseChartOptions = {
    chart: {
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      toolbar: { show: true, tools: { download: true, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false } },
      animations: { enabled: true, easing: "cubic-bezier(0.25, 1, 0.5, 1)", speed: 600 },
    },
    stroke: { curve: "smooth", width: 3, lineCap: "round" },
    grid: { borderColor: "#f1f3f5", strokeDashArray: 4 },
    dataLabels: { enabled: false },
    markers: {
      size: 5,                  // Size of the data points
      strokeWidth: 2,           // Border width of the points
      fillOpacity: 1,
      strokeOpacity: 1,
      hover: {
        size: 7,                // Expansion size when you hover over a point
        sizeOffset: 3
      }
    },
    tooltip: { theme: "light", y: { formatter: (v) => `₹${v.toLocaleString("en-IN")}` } },
    legend: { position: "bottom", fontFamily: "Inter", labels: { colors: "#4a5568" }, itemMargin: { horizontal: 10, vertical: 5 } }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await fetchCategories();
      setLoading(false);
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (categories.length > 0 || !loading) {
      fetchChartData();
    }
  }, [year, month, categories]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/expenses/categories`);
      if (res.data.success) setCategories(res.data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchChartData = async () => {
    setLoading(true);
    try {
      if (month) {
        const res = await axios.get(`${API_BASE_URL}/api/expenses/monthly?year=${year}&month=${month}`);
        if (res.data.success) setSingleMonthData(res.data.data || []);
      } else {
        const promises = [];
        for (let m = 1; m <= 12; m++) {
          promises.push(axios.get(`${API_BASE_URL}/api/expenses/monthly?year=${year}&month=${m}`));
        }
        const responses = await Promise.all(promises);
        
        const compiledMonths = responses.map((res, index) => {
          const breakdown = {};
          categories.forEach(cat => { breakdown[cat.name] = 0; });

          if (res.data.success && res.data.data) {
            res.data.data.forEach((expense) => {
              const catName = expense.category || expense.name;
              if (breakdown[catName] !== undefined) {
                breakdown[catName] += expense.amount;
              }
            });
          }
          return {
            monthNum: index + 1,
            monthName: monthNames[index + 1],
            breakdown,
            total: res.data.success ? res.data.totalExpense : 0
          };
        });
        setRawMonthlyData(compiledMonths);
      }
    } catch (err) {
      console.error("Error compiling data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getMonthlyCategoryBreakdown = () => {
    const totalsByCategory = {};
    let totalSum = 0;
    let maximumTransactionValue = 0;
    let highestSpenderCategory = "None";
    
    singleMonthData.forEach(item => {
      const cat = item.category || item.name;
      totalsByCategory[cat] = (totalsByCategory[cat] || 0) + item.amount;
      totalSum += item.amount;
    });

    Object.entries(totalsByCategory).forEach(([category, amount]) => {
      if (amount > maximumTransactionValue) {
        maximumTransactionValue = amount;
        highestSpenderCategory = category;
      }
    });

    return {
      labels: Object.keys(totalsByCategory),
      series: Object.values(totalsByCategory),
      totalSum: totalSum,
      highestSpenderCategory,
      maximumTransactionValue,
      tableData: Object.entries(totalsByCategory).map(([category, amount]) => ({ category, amount }))
    };
  };

  const getAnnualGrossCalculations = () => {
    let sumTotal = 0;
    let maxMonthTotal = 0;
    let maxMonthName = "N/A";
    
    rawMonthlyData.forEach(m => {
      sumTotal += m.total;
      if (m.total > maxMonthTotal) {
        maxMonthTotal = m.total;
        maxMonthName = m.monthName;
      }
    });
    return { sumTotal, maxMonthTotal, maxMonthName };
  };

  const config = (() => {
    // 1. YEARLY OVERVIEW (All Months, All Categories)
    if (!month && selectedCategory === "ALL") {
      const totalSeriesData = rawMonthlyData.map(m => m.total || 0);
      return {
        type: "bar",
        series: [{ name: "Total Monthly Outflows", data: totalSeriesData }],
        options: {
          ...baseChartOptions,
          xaxis: { categories: monthNames.slice(1), labels: { style: { colors: "#718096" } } },
          yaxis: { labels: { formatter: (v) => `₹${v.toLocaleString("en-IN")}`, style: { colors: "#718096" } } },
          fill: { type: "gradient", gradient: { shade: "light", type: "vertical", opacityFrom: 0.85, opacityTo: 0.55 } },
          colors: ["#3b82f6"]
        }
      };
    }

    // 2. SPECIFIC CATEGORY ANNUAL TREND (e.g., Loan EMI over 12 Months)
    if (!month && selectedCategory !== "ALL") {
      const seriesData = rawMonthlyData.map(m => m.breakdown[selectedCategory] || 0);
      return {
        type: "area",
        series: [{ name: selectedCategory, data: seriesData }],
        options: {
          ...baseChartOptions,
          xaxis: { categories: monthNames.slice(1) },
          yaxis: { labels: { formatter: (v) => `₹${v.toLocaleString("en-IN")}` } },
          fill: { type: "gradient", gradient: { shade: "light", type: "vertical", opacityFrom: 0.4, opacityTo: 0.02 } },
          colors: ["#10b981"]
        }
      };
    }

    // 3. MONTHLY OVERVIEW WITH CENTER TOTAL (Month Selected, All Categories Matrix)
    if (month && selectedCategory === "ALL") {
      const dataBreakdown = getMonthlyCategoryBreakdown();
      return {
        type: "donut",
        series: dataBreakdown.series,
        options: {
          ...baseChartOptions,
          labels: dataBreakdown.labels,
          colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"],
          plotOptions: {
            pie: {
              donut: {
                size: "75%",
                labels: {
                  show: true,
                  name: { show: true, fontSize: "14px", color: "#64748b", offsetY: -8 },
                  value: { show: true, fontSize: "22px", fontWeight: "700", color: "#1e293b", offsetY: 8, formatter: (val) => `₹${parseInt(val).toLocaleString("en-IN")}` },
                  total: { show: true, label: "Gross Total", fontSize: "13px", fontWeight: "600", color: "#64748b", formatter: () => `₹${dataBreakdown.totalSum.toLocaleString("en-IN")}` }
                }
              }
            }
          },
          noData: { text: "No ledger item lines found." }
        }
      };
    }

    // 4. SPECIFIC MONTH & SPECIFIC CATEGORY
    if (month && selectedCategory !== "ALL") {
      const items = singleMonthData.filter(item => (item.category || item.name) === selectedCategory);
      return {
        type: "area",
        series: [{ name: selectedCategory, data: items.map(i => i.amount) }],
        options: {
          ...baseChartOptions,
          xaxis: { categories: items.map(i => i.name || "Unspecified Ledger") },
          yaxis: { labels: { formatter: (v) => `₹${v.toLocaleString("en-IN")}` } },
          fill: { type: "gradient", gradient: { shade: "light", type: "vertical", opacityFrom: 0.4, opacityTo: 0.02 } },
          colors: ["#6366f1"]
        }
      };
    }
  })();

  const currentMonthlyBreakdown = month && selectedCategory === "ALL" ? getMonthlyCategoryBreakdown() : null;
  const currentAnnualGross = !month ? getAnnualGrossCalculations() : null;

  return (
    <section style={{ padding: "clamp(12px, 3vw, 30px)", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      <style>{`
        .pro-dashboard-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05); padding: 24px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .pro-filter-select { padding: 10px 16px; border-radius: 10px; border: 1px solid #cbd5e1; background-color: #ffffff; color: #334155; font-size: 14px; font-weight: 500; outline: none; transition: border-color 0.2s, box-shadow 0.2s; cursor: pointer; width: 100%; min-width: 160px; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C./svg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-size: 16px; padding-right: 40px; }
        .pro-filter-select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
        .pro-btn-back { background: #1e293b; color: #ffffff; border: none; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; display: inline-flex; align-items: center; gap: 8px; }
        .pro-btn-back:hover { background: #334155; }
        .pro-table-wrapper { overflow: hidden; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; }
        .pro-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
        .pro-table th { background: #f8fafc; padding: 14px 18px; font-weight: 600; color: #64748b; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
        .pro-table td { padding: 14px 18px; color: #334155; border-bottom: 1px solid #f1f5f9; }
        .pro-table tr:last-child td { border-bottom: none; }
        
        .grid-header-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; margin-bottom: 28px; }
        .grid-filter-bar { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px; width: 100%; }
        .grid-metric-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 28px; }
        .grid-split-view { display: grid; grid-template-columns: 1.2fr 1fr; gap: 32px; align-items: start; }
        
        @media (max-width: 968px) {
          .grid-split-view { grid-template-columns: 1fr; gap: 24px; }
        }
      `}</style>

      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        
        {/* Top Header Grid Section */}
        <div className="grid-header-row">
          <div>
            <h1 style={{ margin: 0, color: "#0f172a", fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: "800", letterSpacing: "-0.02em" }}>Expense Analytics Engine</h1>
            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>Seamless financial performance mapping matrix</p>
          </div>
          <button onClick={() => navigate(-1)} className="pro-btn-back">
            <svg style={{ width: "16px", height: "16px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Grid
          </button>
        </div>

        {/* Dynamic Filters Control Grid Card */}
        <div className="pro-dashboard-card" style={{ padding: "20px", marginBottom: "28px" }}>
          <div className="grid-filter-bar" style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontWeight: "600", fontSize: "13px", color: "#475569" }}>Accounting Year</label>
              <select value={year} onChange={(e) => setYear(e.target.value)} className="pro-filter-select">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontWeight: "600", fontSize: "13px", color: "#475569" }}>Timeline Window</label>
              <select value={month} onChange={(e) => setMonth(e.target.value)} className="pro-filter-select">
                <option value="">Full Year Summary</option>
                {monthNames.map((m, idx) => idx > 0 && <option key={idx} value={idx}>{m}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontWeight: "600", fontSize: "13px", color: "#475569" }}>Expense Segment Target</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="pro-filter-select">
                <option value="ALL">All Categories Matrix</option>
                {categories.map(cat => <option key={cat._id || cat.name} value={cat.name}>{cat.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* High-End Dynamic KPIs Summary Section */}
        {!loading && (
          <div className="grid-metric-row">
            <div className="pro-dashboard-card" style={{ borderLeft: "5px solid #3b82f6" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Calculated Net Outflow</span>
              <h2 style={{ margin: "8px 0 0 0", color: "#0f172a", fontSize: "26px", fontWeight: "700" }}>
                ₹{month && currentMonthlyBreakdown ? currentMonthlyBreakdown.totalSum.toLocaleString("en-IN") : currentAnnualGross?.sumTotal.toLocaleString("en-IN")}/-
              </h2>
            </div>
            
            <div className="pro-dashboard-card" style={{ borderLeft: "5px solid #10b981" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {month ? "Top Spender Category" : "Peak Spending Month"}
              </span>
              <h2 style={{ margin: "8px 0 0 0", color: "#0f172a", fontSize: "20px", fontWeight: "700", textTransform: "capitalize", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {month ? currentMonthlyBreakdown?.highestSpenderCategory : currentAnnualGross?.maxMonthName}
              </h2>
            </div>

            <div className="pro-dashboard-card" style={{ borderLeft: "5px solid #f59e0b" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Peak Operational Value</span>
              <h2 style={{ margin: "8px 0 0 0", color: "#0f172a", fontSize: "26px", fontWeight: "700" }}>
                ₹{month ? currentMonthlyBreakdown?.maximumTransactionValue.toLocaleString("en-IN") : currentAnnualGross?.maxMonthTotal.toLocaleString("en-IN")}/-
              </h2>
            </div>
          </div>
        )}

        {/* Main Operational Presentation Panel Card */}
        <div className="pro-dashboard-card">
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "350px", gap: "12px" }}>
              <div style={{ width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "500" }}>Consolidating multi-ledger matrices...</span>
            </div>
          ) : (
            <div>
              {month && selectedCategory === "ALL" && currentMonthlyBreakdown ? (
                <div className="grid-split-view">
                  
                  {/* Left Column: Interactive Donut Chart */}
                  <div style={{ width: "100%", padding: "10px 0" }}>
                    <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "16px", fontWeight: "700" }}>Volumetric Proportional Distribution</h3>
                    <Chart options={config.options} series={config.series} type={config.type} height={380} />
                  </div>

                  {/* Right Column: Ledger Table */}
                  <div style={{ width: "100%" }}>
                    <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "16px", fontWeight: "700" }}>Category Breakdown Ledger List</h3>
                    <div className="pro-table-wrapper">
                      <table className="pro-table">
                        <thead>
                          <tr>
                            <th>Expense Category</th>
                            <th style={{ textAlign: "right" }}>Total Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentMonthlyBreakdown.tableData.length > 0 ? (
                            currentMonthlyBreakdown.tableData.map((row, index) => (
                              <tr key={index}>
                                <td style={{ fontWeight: "600", color: "#334155" }}>{row.category}</td>
                                <td style={{ textAlign: "right", fontWeight: "700", color: "#0f172a" }}>
                                  ₹{row.amount.toLocaleString("en-IN")}/-
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="2" style={{ textAlign: "center", color: "#94a3b8", padding: "30px" }}>No operational logs found.</td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: "#f8fafc", fontWeight: "700" }}>
                            <td style={{ padding: "16px 18px", color: "#475569" }}>Gross Matrix Total:</td>
                            <td style={{ padding: "16px 18px", textAlign: "right", color: "#ef4444", fontSize: "15px" }}>
                              ₹{currentMonthlyBreakdown.totalSum.toLocaleString("en-IN")}/-
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                </div>
              ) : (
                /* Full Width Fallback Configuration View */
                <div style={{ width: "100%" }}>
                  <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "16px", fontWeight: "700" }}>
                    {!month ? `Annual Operational Distribution Timeline — ${year}` : `${selectedCategory} Cost Trajectory`}
                  </h3>
                  <Chart options={config.options} series={config.series} type={config.type} height={420} />
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default ExpenseCharts;