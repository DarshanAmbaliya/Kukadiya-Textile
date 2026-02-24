import axios from "axios";
import React, { useEffect, useState } from "react";

const Production = () => {
  const [fabricQuality, setfebricQuality] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [footerMeters, setFooterMeters] = useState({
    compressorMeter: "",
    mainMeter: ""
  });

  /**
 * FIXED API URL LOGIC
 * This ensures the URL never evaluates to "undefined".
 * If you are on Netlify, it uses the production Railway URL.
 * If you are on your computer, it uses localhost.
 */
  const API_BASE_URL = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://mahakali-textiles.onrender.com";

  const API_URL = `${API_BASE_URL}`;

  const [machines, setMachines] = useState(
    Array.from({ length: 16 }, (_, i) => ({
      machineNumber: i + 1,
      quality: "",
      reed: "",
      rpm: "",
      bimNumber: "",
      bimBalance: "",
      dayMeter: 0,
      nightMeter: 0,
      dayEff: 0,
      nightEff: 0,
      pick: 0
    }))
  );

  const [operators, setOperators] = useState({
    day: ["", "", "", ""],
    night: ["", "", "", ""]
  });

  const [productionData, setProductionData] = useState({});

  // Fetch fabric quality data
  useEffect(() => {
    const fetchFabrics = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/fabrics`);
        setfebricQuality(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFabrics();
  }, []);

  // Totals and averages
  const totalDayProd = machines.reduce(
    (s, m) => s + (parseFloat(m.dayMeter) || 0),
    0
  );
  const totalNightProd = machines.reduce(
    (s, m) => s + (parseFloat(m.nightMeter) || 0),
    0
  );
  const totalProdMeter = totalDayProd + totalNightProd;

  const totalBimBalSum = machines.reduce(
    (s, m) => s + (parseFloat(m.bimBalance) || 0),
    0
  );

  const dayEffValues = machines
    .map(m => parseFloat(m.dayEff))
    .filter(v => v > 0);

  const avgDayEff = dayEffValues.length
    ? (dayEffValues.reduce((a, b) => a + b, 0) / dayEffValues.length).toFixed(2)
    : "0.00";

  const nightEffValues = machines
    .map(m => parseFloat(m.nightEff))
    .filter(v => v > 0);

  const avgNightEff = nightEffValues.length
    ? (nightEffValues.reduce((a, b) => a + b, 0) / nightEffValues.length).toFixed(2)
    : "0.00";

  const pickValues = machines
    .map(m => parseFloat(m.pick))
    .filter(v => v > 0);

  const avgTotalPick = pickValues.length
    ? (pickValues.reduce((a, b) => a + b, 0) / pickValues.length).toFixed(2)
    : "0.00";

  const avgTotalRPM = (() => {
    const rpmVals = machines.map(m => parseFloat(m.rpm)).filter(v => v > 0);
    return rpmVals.length
      ? (rpmVals.reduce((a, b) => a + b, 0) / rpmVals.length).toFixed(2)
      : "0.00";
  })();

  const calculateAvg = (opIdx, field) => {
    const block = machines.slice(opIdx * 4, opIdx * 4 + 4);

    const values = block
      .map(m => parseFloat(m[field]))
      .filter(v => v > 0);

    return values.length
      ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
      : "0.00";
  };

  const calculateSum = (opIdx, field) => {
    const block = machines.slice(opIdx * 4, opIdx * 4 + 4);
    return block.reduce((acc, m) => acc + (parseFloat(m[field]) || 0), 0).toFixed(2);
  };

  // Prepare production data object
  useEffect(() => {
    const dateObj = new Date(selectedDate);
    const year = dateObj.getFullYear();
    const months = [
      "january", "february", "march", "april", "may", "june", "july",
      "august", "september", "october", "november", "december"
    ];
    const monthName = months[dateObj.getMonth()];
    const dateStr = `${String(dateObj.getDate()).padStart(2, "0")}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${year}`;

    const entries = [];

    for (let i = 0; i < 4; i++) {
      const machineBlock = machines.slice(i * 4, i * 4 + 4);

      ["Day", "Night"].forEach((shift) => {
        entries.push({
          operator_name: shift === "Day" ? operators.day[i] : operators.night[i],
          shift,
          average_meter: calculateAvg(i, shift === "Day" ? "dayMeter" : "nightMeter"),
          average_efficiency: calculateAvg(i, shift === "Day" ? "dayEff" : "nightEff"),
          machine_production: machineBlock.map((m) => ({
            machineNumber: m.machineNumber,
            quality: m.quality,
            reed: m.reed,
            rpm: m.rpm,
            bimNumber: m.bimNumber,
            bimBalance: m.bimBalance,
            meter: shift === "Day" ? m.dayMeter : m.nightMeter,
            efficiency: shift === "Day" ? m.dayEff : m.nightEff,
            pick: m.pick
          }))
        });
      });
    }

    setProductionData({
      [year]: {
        [monthName]: {
          [dateStr]: {
            summary: {
              total_production_meter: totalProdMeter,
              total_day_production: totalDayProd,
              total_night_production: totalNightProd,
              total_bim_balance_sum: totalBimBalSum,
              total_average_pick: avgTotalPick,
              total_average_rpm: avgTotalRPM,
              total_average_day_efficiency: avgDayEff,
              total_average_night_efficiency: avgNightEff,
              compressor_meter: footerMeters.compressorMeter,
              main_meter: footerMeters.mainMeter,
              total_day_lost_meter: totalDayLost,
              total_night_lost_meter: totalNightLost,
              total_lost_meter: grandTotalLost
            },
            operator_data: entries
          }
        }
      }
    });
  }, [machines, operators, selectedDate, footerMeters]);

  // Input change handlers
  const handleInputChange = (index, field, value) => {
    const updated = [...machines];
    updated[index][field] = value;
    setMachines(updated);
  };

  const handleOpNameChange = (shift, opIdx, value) => {
    setOperators((prev) => ({
      ...prev,
      [shift]: prev[shift].map((name, i) => (i === opIdx ? value : name))
    }));
  };

  // Save production and clear fields
  const saveProduction = async () => {
    try {
      await axios.post(`${API_URL}/api/production`, productionData);
      alert("Production Saved Successfully");
    } catch (err) {
      console.error(err);
      alert("Error Saving Production");
    }
  };

  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const dateObj = new Date(selectedDate);
        const year = dateObj.getFullYear();
        const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
        const monthName = months[dateObj.getMonth()];
        const dateStr = `${String(dateObj.getDate()).padStart(2, "0")}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${year}`;

        const res = await axios.get(`${API_URL}/api/production/${year}`);
        const yearData = res.data;

        if (yearData?.[monthName]?.[dateStr]) {
          const existing = yearData[monthName][dateStr];
          setFooterMeters({
            mainMeter: existing.summary?.main_meter || "",
            compressorMeter: existing.summary?.compressor_meter || ""
          });
          // setAvgTotalRPM(existing.summary?.total_average_rpm || "0.00");
          const opData = existing.operator_data;

          // 1. Map Operators
          const newOps = { day: ["", "", "", ""], night: ["", "", "", ""] };
          opData.forEach((entry, idx) => {
            const blockIdx = Math.floor(idx / 2);
            if (entry.shift === "Day") newOps.day[blockIdx] = entry.operator_name;
            else newOps.night[blockIdx] = entry.operator_name;
          });
          setOperators(newOps);

          // 2. Map Machines
          const updatedMachines = machines.map((m) => {
            let machineInfo = { ...m };
            opData.forEach((entry) => {
              const foundMatch = entry.machine_production.find(p => p.machineNumber === m.machineNumber);
              if (foundMatch) {
                machineInfo = {
                  ...machineInfo,
                  quality: foundMatch.quality || "",
                  reed: foundMatch.reed || "",
                  rpm: foundMatch.rpm || "",
                  bimNumber: foundMatch.bimNumber || "",
                  bimBalance: foundMatch.bimBalance || "",
                  pick: foundMatch.pick || 0,
                  // Load actual production for this specific date
                  dayMeter: entry.shift === "Day" ? foundMatch.meter : machineInfo.dayMeter,
                  dayEff: entry.shift === "Day" ? foundMatch.efficiency : machineInfo.dayEff,
                  nightMeter: entry.shift === "Night" ? foundMatch.meter : machineInfo.nightMeter,
                  nightEff: entry.shift === "Night" ? foundMatch.efficiency : machineInfo.nightEff,
                };
              }
            });
            return machineInfo;
          });
          setMachines(updatedMachines);
        } else {
          // OPTIONAL: Reset production meters if date is empty, 
          // but keep Quality/RPM/Reed from the current state.
          setMachines(prev => prev.map(m => ({
            ...m,
            dayMeter: 0,
            nightMeter: 0,
            dayEff: 0,
            nightEff: 0
          })));
        }
      } catch (err) {
        console.error("Error syncing data:", err);
      }
    };

    fetchExistingData();
  }, [selectedDate]);

  useEffect(() => {
    const loadLatestDate = async () => {
      try {
        const year = new Date().getFullYear();
        const res = await axios.get(`${API_URL}/api/production/${year}`);
        const yearData = res.data;

        if (!yearData) return;

        const monthsOrder = [
          "january", "february", "march", "april", "may", "june",
          "july", "august", "september", "october", "november", "december"
        ];

        let latestDate = null;

        monthsOrder.forEach(month => {
          if (yearData[month]) {
            Object.keys(yearData[month]).forEach(dateStr => {
              const [d, m, y] = dateStr.split("-");
              const dateObj = new Date(`${y}-${m}-${d}`);
              if (!latestDate || dateObj > latestDate) {
                latestDate = dateObj;
              }
            });
          }
        });

        if (latestDate) {
          setSelectedDate(latestDate.toISOString().split("T")[0]);
        }
      } catch (err) {
        console.error("Error loading latest production date", err);
      }
    };

    loadLatestDate();
  }, []);

  const calculateLostMeter = (rpm, efficiency, pick, actualMeter) => {
    const r = Number(rpm);
    const e = Number(efficiency);
    const p = Number(pick);
    const actual = Number(actualMeter);

    if (r <= 0 || e <= 0 || p <= 0) return 0;

    const ideal = (r * (e / 100) * 12 * 60) / (39.37 * p);

    const diff = actual - ideal;   // IMPORTANT CHANGE

    return diff;
  };

  const totalDayLost = machines.reduce((sum, m) => {
    return sum + parseFloat(
      calculateLostMeter(m.rpm, m.dayEff, m.pick, m.dayMeter)
    );
  }, 0);

  const totalNightLost = machines.reduce((sum, m) => {
    return sum + parseFloat(
      calculateLostMeter(m.rpm, m.nightEff, m.pick, m.nightMeter)
    );
  }, 0);

  const grandTotalLost = totalDayLost + totalNightLost;

  const formatLostMeter = (value) => {
    const num = Number(value);

    if (num > 0) return `+${num.toFixed(2)}`;
    if (num < 0) return `${num.toFixed(2)}`;
    return "0.00";
  };

  const isLowBim = (value) => {
    const num = Number(value);
    return num !== 0 && num <= 3000;
  };

  return (
    <section className="Production-table" style={{ padding: "20px" }}>
      <div className="container">
        <h2 style={{ display: "flex", justifyContent: 'center', gap: "20px", textAlign: "center", marginBottom: "20px" }}>
          Factory Production Entry
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </h2>

        <table border="1" style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", fontSize: "11px" }}>
          <thead style={{ backgroundColor: "#f2f2f2" }}>
            <tr>
              <th rowSpan="2">M/C</th>
              <th rowSpan="2">Quality</th>
              <th rowSpan="2">Reed</th>
              <th rowSpan="2">RPM</th>
              <th rowSpan="2">BIM Number</th>
              <th colSpan="2">Meters</th>
              <th rowSpan="2">BIM Balance</th>
              <th colSpan="2">Eff %</th>
              <th colSpan="2">Operator & Avg</th>
              <th colSpan="2">Loss Meter</th>
              <th rowSpan="2">Pick</th>
            </tr>
            <tr>
              <th>Day</th>
              <th>Night</th>
              <th>Day</th>
              <th>Night</th>
              <th>Day Shift</th>
              <th>Night Shift</th>
              <th style={{ width: "83px" }}>Day Shift</th>
              <th style={{ width: "83px" }}>Night Shift</th>
            </tr>
          </thead>

          <tbody>
            {machines.map((m, index) => {
              const opIdx = Math.floor(index / 4);
              const isFirst = index % 4 === 0;

              const dayLost = calculateLostMeter(m.rpm, m.dayEff, m.pick, m.dayMeter);
              const nightLost = calculateLostMeter(m.rpm, m.nightEff, m.pick, m.nightMeter);

              return (
                <tr key={m.machineNumber}>
                  <td>{m.machineNumber}</td>
                  <td>
                    <select
                      value={m.quality}
                      onChange={(e) => handleInputChange(index, "quality", e.target.value)}
                    >
                      <option value="">Select</option>
                      {fabricQuality.map((f) => (
                        <option key={f._id} value={f.fabric_name}>{f.fabric_name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      value={m.reed}
                      onChange={(e) => handleInputChange(index, "reed", e.target.value)}
                      style={{ width: "30px" }}
                    />
                  </td>
                  <td>
                    <input
                      value={m.rpm}
                      onChange={(e) => handleInputChange(index, "rpm", e.target.value)}
                      style={{ width: "30px" }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={m.bimNumber}
                      onChange={(e) => handleInputChange(index, "bimNumber", e.target.value)}
                      style={{ width: "45px" }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={m.dayMeter}
                      onChange={(e) => handleInputChange(index, "dayMeter", e.target.value)}
                      style={{ width: "45px" }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={m.nightMeter}
                      onChange={(e) => handleInputChange(index, "nightMeter", e.target.value)}
                      style={{ width: "45px" }}
                    />
                  </td>
                  <td style={{
                    backgroundColor: isLowBim(m.bimBalance) ? "red" : "inherit"
                  }}
                  >
                    <input
                      type="number"
                      value={m.bimBalance}
                      onChange={(e) => handleInputChange(index, "bimBalance", e.target.value)}
                      style={{
                        width: "50px",
                        backgroundColor: isLowBim(m.bimBalance) ? "red" : "inherit",
                        color: isLowBim(m.bimBalance) ? "white" : "inherit",
                        fontWeight: isLowBim(m.bimBalance) ? "bold" : "normal"
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={m.dayEff}
                      onChange={(e) => handleInputChange(index, "dayEff", e.target.value)}
                      style={{ width: "35px" }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={m.nightEff}
                      onChange={(e) => handleInputChange(index, "nightEff", e.target.value)}
                      style={{ width: "35px" }}
                    />
                  </td>

                  {isFirst && (
                    <>
                      {/* Day Shift */}
                      <td rowSpan="4">
                        <div>
                          <label>Operator:</label>
                          <input
                            value={operators.day[opIdx]}
                            onChange={(e) => handleOpNameChange("day", opIdx, e.target.value)}
                            style={{
                              marginTop: "2px",
                              marginBottom: "5px",
                              padding: "2px",
                              fontSize: "11px"
                            }}
                          />
                        </div>
                        <div style={{ fontSize: "11px", marginBottom: "3px" }}>
                          <strong>Total Meter:</strong> {calculateSum(opIdx, "dayMeter")}
                        </div>
                        <div style={{ fontSize: "11px", marginBottom: "3px" }}>
                          <strong>Average Meter:</strong> {calculateAvg(opIdx, "dayMeter")}
                        </div>
                        <div style={{ fontSize: "11px" }}>
                          <strong>Average Efficiency:</strong> {calculateAvg(opIdx, "dayEff")}%
                        </div>
                      </td>

                      {/* Night Shift */}
                      <td rowSpan="4">
                        <div>
                          <label>Operator:</label>
                          <input
                            value={operators.night[opIdx]}
                            onChange={(e) => handleOpNameChange("night", opIdx, e.target.value)}
                            style={{
                              marginTop: "2px",
                              marginBottom: "5px",
                              padding: "2px",
                              fontSize: "11px"
                            }}
                          />
                        </div>
                        <div style={{ fontSize: "11px", marginBottom: "3px" }}>
                          <strong>Total Meter:</strong> {calculateSum(opIdx, "nightMeter")}
                        </div>
                        <div style={{ fontSize: "11px", marginBottom: "3px" }}>
                          <strong>Average Meter:</strong> {calculateAvg(opIdx, "nightMeter")}
                        </div>
                        <div style={{ fontSize: "11px" }}>
                          <strong>Average Efficiency:</strong> {calculateAvg(opIdx, "nightEff")}%
                        </div>
                      </td>
                    </>
                  )}

                  <td
                    style={{
                      fontSize: "13px",
                      color:
                        dayLost > 0
                          ? "green"
                          : dayLost < 0
                            ? "red"
                            : "inherit",
                      fontWeight: 'bold'
                    }}
                  >
                    {formatLostMeter(dayLost)}
                  </td>

                  <td
                    style={{
                      fontSize: "13px",
                      color:
                        nightLost > 0
                          ? "green"
                          : nightLost < 0
                            ? "red"
                            : "inherit",
                      fontWeight: 'bold'
                    }}
                  >
                    {formatLostMeter(nightLost)}
                  </td>

                  <td>
                    <input
                      type="number"
                      value={m.pick}
                      onChange={(e) => handleInputChange(index, "pick", e.target.value)}
                      style={{ width: "40px" }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot className="production-tfoot" style={{ backgroundColor: "#eee", fontWeight: "bold" }}>
            <tr>
              <td colSpan="3">SHIFT TOTALS</td>
              <td>{avgTotalRPM}</td>
              <td></td>
              <td>{totalDayProd}</td>
              <td>{totalNightProd}</td>
              <td style={{ color: "blue" }}>{totalBimBalSum}</td>
              <td>{avgDayEff}%</td>
              <td>{avgNightEff}%</td>
              <td colSpan="2">Total Meter: {totalProdMeter}</td>
              <td
                style={{
                  fontSize: "13px",
                  color:
                    totalDayLost > 0
                      ? "green"
                      : totalDayLost < 0
                        ? "red"
                        : "inherit",
                }}
              >
                Day Loss: {formatLostMeter(totalDayLost)}
              </td>

              <td
                style={{
                  fontSize: "13px",
                  color:
                    totalNightLost > 0
                      ? "green"
                      : totalNightLost < 0
                        ? "red"
                        : "inherit",
                }}
              >
                Night Loss: {formatLostMeter(totalNightLost)}
              </td>
              <td>Avg: {avgTotalPick}</td>
            </tr>
            <tr>
              <td colSpan="6" style={{ textAlign: "right" }}>
                Main Meter :
              </td>
              <td colSpan="2">
                <input
                  type="number"
                  value={footerMeters.mainMeter}
                  onChange={(e) =>
                    setFooterMeters(prev => ({
                      ...prev,
                      mainMeter: e.target.value
                    }))
                  }
                  style={{ width: "100px" }}
                />
              </td>
              <td colSpan="2">
                Average Effciency: <br /> <hr />{(
                  (parseFloat(avgDayEff) + parseFloat(avgNightEff)) / 2
                ).toFixed(2)}%
              </td>
              <td colSpan="1" style={{ textAlign: "right" }}>
                Compressor Meter :
              </td>
              <td colSpan="1">
                <input
                  type="number"
                  value={footerMeters.compressorMeter}
                  onChange={(e) =>
                    setFooterMeters(prev => ({
                      ...prev,
                      compressorMeter: e.target.value
                    }))
                  }
                  style={{ width: "100px" }}
                />
              </td>
              <td
                colSpan={3}
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "16px",
                  color:
                    grandTotalLost > 0
                      ? "green"
                      : grandTotalLost < 0
                        ? "red"
                        : "inherit",
                }}
              >
                Total Loss Meter :{" "}
                {formatLostMeter(grandTotalLost)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <button
            onClick={saveProduction}
            style={{
              marginLeft: "20px",
              padding: "10px 40px",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px"
            }}
          >
            Save Production Data
          </button>
        </div>
      </div>
    </section>
  );
};

export default Production;
