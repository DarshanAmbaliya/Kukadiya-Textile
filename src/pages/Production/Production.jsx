import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Production = () => {
  const { date } = useParams();
  const [fabricQuality, setfebricQuality] = useState([]);
  const [selectedDate, setSelectedDate] = useState(date || "");
  const [footerMeters, setFooterMeters] = useState({
    compressorMeter: "",
    mainMeter: ""
  });
  const [yarnList, setYarnList] = useState([]); // All available yarns from DB
  const [selectedYarns, setSelectedYarns] = useState([{ yarn_name: "", quantity: "" }]);
  const [employees, setEmployees] = useState([]);
  const [notes, setNotes] = useState("");

  /**
 * FIXED API URL LOGIC
 * This ensures the URL never evaluates to "undefined".
 * If you are on Netlify, it uses the production Railway URL.
 * If you are on your computer, it uses localhost.
 */
  const API_BASE_URL = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://kukadiya-textile.onrender.com";

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
      pick: 0,
      dayOperator: "",
      nightOperator: ""
    }))
  );

  const [operators, setOperators] = useState({
    day: ["", "", "", ""],
    night: ["", "", "", ""]
  });

  const [productionData, setProductionData] = useState({});

  // Fetch fabric quality data
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/employees`);

        const currentYear = new Date().getFullYear();

        const months = [
          "january", "february", "march", "april", "may", "june",
          "july", "august", "september", "october", "november", "december"
        ];

        const currentMonth = months[new Date().getMonth()];

        const employeeList =
          res.data?.[currentYear]?.[currentMonth] || [];

        setEmployees(employeeList);
      } catch (err) {
        console.error(err);
      }
    };
    const fetchFabrics = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/fabrics`);
        setfebricQuality(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    const fetchYarn = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/yarns`);
        setYarnList(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployees();
    fetchFabrics();
    fetchYarn();
  }, []);

  useEffect(() => {

    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/employees`);
        const dateObj = new Date(selectedDate);
        const year = dateObj.getFullYear();
        const months = [
          "january",
          "february",
          "march",
          "april",
          "may",
          "june",
          "july",
          "august",
          "september",
          "october",
          "november",
          "december"
        ];

        const monthName = months[dateObj.getMonth()];

        const employeeList =
          res.data?.[year]?.[monthName] || [];
        setEmployees(employeeList);

      } catch (err) {
        console.log("Employee fetch error", err);
      }
    };

    if (selectedDate) {
      fetchEmployees();
    }
  }, [selectedDate]);

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

  const totalPick = machines.reduce((sum, m) => {
    const totalMeter =
      (Number(m.dayMeter) || 0) +
      (Number(m.nightMeter) || 0);

    return sum + totalMeter * (Number(m.pick) || 0);
  }, 0);

  const weightedAvgPick =
    totalProdMeter > 0
      ? (totalPick / totalProdMeter).toFixed(2)
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
    const calculateTotalTargetMeter = () => {
      return machines.reduce((sum, machine) => {
        const rpm = Number(machine.rpm);
        const pick = Number(machine.pick);

        if (rpm <= 0 || pick <= 0) return sum;

        let target = 0;

        const dayEff = Number(machine.dayEff);
        if (dayEff > 0) {
          target += (rpm * (dayEff / 100) * 12 * 60) / (39.37 * pick);
        }

        const nightEff = Number(machine.nightEff);
        if (nightEff > 0) {
          target += (rpm * (nightEff / 100) * 12 * 60) / (39.37 * pick);
        }

        return sum + target;
      }, 0);
    };

    const totalTargetMeter = calculateTotalTargetMeter();
    // console.log(totalTargetMeter);
    const machineStopLoss = totalProdMeter - totalTargetMeter;

    // DAY SHIFT
    const dayOperators = [
      ...new Set(
        machines
          .map(m => m.dayOperator)
          .filter(Boolean)
      )
    ];

    dayOperators.forEach((operatorName) => {
      const machineBlock = machines.filter(
        m => m.dayOperator === operatorName
      );

      entries.push({
        operator_name: operatorName,
        shift: "Day",
        average_meter:
          machineBlock.length > 0
            ? (
              machineBlock.reduce(
                (sum, m) => sum + (Number(m.dayMeter) || 0),
                0
              ) / machineBlock.length
            ).toFixed(2)
            : 0,

        average_efficiency:
          machineBlock.length > 0
            ? (
              machineBlock.reduce(
                (sum, m) => sum + (Number(m.dayEff) || 0),
                0
              ) / machineBlock.length
            ).toFixed(2)
            : 0,

        machine_production: machineBlock.map(m => {
          const meter = Number(m.dayMeter) || 0;
          const pick = Number(m.pick) || 0;
          return {
            machineNumber: m.machineNumber,
            quality: m.quality,
            reed: m.reed,
            rpm: m.rpm,
            bimNumber: m.bimNumber,
            bimBalance: m.bimBalance,
            meter,
            efficiency: m.dayEff,
            pick,
            machinePick: meter * pick,
            operator: operatorName
          };
        })
      });
    });

    // NIGHT SHIFT
    const nightOperators = [
      ...new Set(
        machines
          .map(m => m.nightOperator)
          .filter(Boolean)
      )
    ];

    nightOperators.forEach((operatorName) => {
      const machineBlock = machines.filter(
        m => m.nightOperator === operatorName
      );

      entries.push({
        operator_name: operatorName,
        shift: "Night",

        average_meter:
          machineBlock.length > 0
            ? (
              machineBlock.reduce(
                (sum, m) => sum + (Number(m.nightMeter) || 0),
                0
              ) / machineBlock.length
            ).toFixed(2)
            : 0,

        average_efficiency:
          machineBlock.length > 0
            ? (
              machineBlock.reduce(
                (sum, m) => sum + (Number(m.nightEff) || 0),
                0
              ) / machineBlock.length
            ).toFixed(2)
            : 0,

        machine_production: machineBlock.map(m => {
          const meter = Number(m.nightMeter) || 0;
          const pick = Number(m.pick) || 0;
          return {
            machineNumber: m.machineNumber,
            quality: m.quality,
            reed: m.reed,
            rpm: m.rpm,
            bimNumber: m.bimNumber,
            bimBalance: m.bimBalance,
            meter,
            efficiency: m.nightEff,
            pick,
            machinePick: meter * pick,
            operator: operatorName
          };
        })
      });
    });

    const totalPick = entries.reduce((total, operator) => {
      operator.machine_production.forEach(machine => {
        total += machine.machinePick;
      });

      return total;
    }, 0);
    // console.log(totalPick);

    setProductionData({
      [year]: {
        [monthName]: {
          [dateStr]: {
            summary: {
              total_production_meter: totalProdMeter,
              total_day_production: totalDayProd,
              total_night_production: totalNightProd,
              total_bim_balance_sum: totalBimBalSum,
              total_average_pick: weightedAvgPick,
              total_average_rpm: avgTotalRPM,
              total_average_day_efficiency: avgDayEff,
              total_average_night_efficiency: avgNightEff,
              compressor_meter: footerMeters.compressorMeter,
              main_meter: footerMeters.mainMeter,
              total_pick: totalPick,
              total_day_lost_meter: totalDayLost,
              total_night_lost_meter: totalNightLost,
              total_lost_meter: grandTotalLost,
              target_production_meter: totalTargetMeter.toFixed(2),
              machine_stop_loss_meter: Number(machineStopLoss.toFixed(2)) - Number(grandTotalLost),
              yarn: selectedYarns.filter(y => y.yarn_name !== "" && y.quantity !== ""),
              notes: notes,
            },
            operator_data: entries
          }
        }
      }
    });
  }, [machines, operators, selectedDate, footerMeters, selectedYarns, notes]);

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
          setNotes(existing.summary?.notes || "");
          if (existing.summary?.yarn && existing.summary.yarn.length > 0) {
            setSelectedYarns(existing.summary.yarn);
          } else {
            setSelectedYarns([{ yarn_name: "", quantity: "" }]);
          }
          // setAvgTotalRPM(existing.summary?.total_average_rpm || "0.00");
          const opData = existing.operator_data;

          const newOps = {
            day: ["", "", "", ""],
            night: ["", "", "", ""]
          };

          opData.forEach((entry, idx) => {
            const name = entry.operator_name?.trim() || "";
            const blockIdx = Math.floor(idx / 2);

            if (entry.shift === "Day")
              newOps.day[blockIdx] = name;

            else
              newOps.night[blockIdx] = name;
          });
          setOperators(newOps);

          // 2. Map Machines
          const updatedMachines = machines.map((m) => {
            let machineInfo = { ...m };
            opData.forEach((entry) => {
              const foundMatch = entry.machine_production.find(
                p => Number(p.machineNumber) === Number(m.machineNumber)
              );
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
                  dayOperator: entry.shift === "Day"
                    ? entry.operator_name
                    : machineInfo.dayOperator,

                  nightOperator: entry.shift === "Night"
                    ? entry.operator_name
                    : machineInfo.nightOperator,
                  dayMeter: entry.shift === "Day" ? foundMatch.meter : machineInfo.dayMeter,
                  dayEff: entry.shift === "Day" ? foundMatch.efficiency : machineInfo.dayEff,
                  nightMeter: entry.shift === "Night" ? foundMatch.meter : machineInfo.nightMeter,
                  nightEff: entry.shift === "Night" ? foundMatch.efficiency : machineInfo.nightEff,
                };
              }
            });
            return machineInfo;
          });
          updatedMachines.forEach(m => {
            console.log(
              m.machineNumber,
              "Day:", m.dayOperator,
              "Night:", m.nightOperator
            );
          });
          setMachines(updatedMachines);
        } else {
          // OPTIONAL: Reset production meters if date is empty, 
          // but keep Quality/RPM/Reed from the current state.
          setNotes("");

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
      if (date) return;
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
  }, [date]);

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

  useEffect(() => {
    const fetchYarns = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/yarns`); // Assuming this is your endpoint
        setYarnList(res.data);
      } catch (err) {
        console.error("Error fetching yarns:", err);
      }
    };
    fetchYarns();
  }, []);
  const handleYarnChange = (index, field, value) => {
    const updated = [...selectedYarns];
    updated[index][field] = value;
    setSelectedYarns(updated);
  };

  const addYarnRow = () => {
    setSelectedYarns([...selectedYarns, { yarn_name: "", quantity: "" }]);
  };

  const removeYarnRow = (index) => {
    setSelectedYarns(selectedYarns.filter((_, i) => i !== index));
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
            style={{ cursor: 'pointer' }}
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
              console.log(
                m.machineNumber,
                JSON.stringify(m.dayOperator),
                employees.some(e => e.name === m.dayOperator)
              );
              console.log(
                m.machineNumber,
                JSON.stringify(m.nightOperator),
                employees.some(e => e.name === m.nightOperator)
              );
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

                  {/* {isFirst && ( */}
                  <>
                    {/* Day Shift */}
                    {/* <td rowSpan="4">
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
                      </td> */}

                    {/* Night Shift */}
                    {/* <td rowSpan="4">
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
                      </td> */}
                  </>
                  {/* )} */}
                  <td>
                    <select
                      value={m.dayOperator}
                      onChange={(e) =>
                        handleInputChange(index, "dayOperator", e.target.value)
                      }
                    >
                      <option value="">Select Operator</option>

                      {employees.map((emp, i) => (
                        <option
                          key={i}
                          value={emp.name}
                        >
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <select
                      value={m.nightOperator}
                      onChange={(e) =>
                        handleInputChange(index, "nightOperator", e.target.value)
                      }
                    >
                      <option value="">Select Operator</option>

                      {employees.map((emp, i) => (
                        <option
                          key={i}
                          value={emp.name}
                        >
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </td>

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
              <td>Avg: {weightedAvgPick}</td>
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
                Average Effciency: <br /> <hr />
                {(() => {
                  const day = parseFloat(avgDayEff) || 0;
                  const night = parseFloat(avgNightEff) || 0;

                  return day > 0 && night > 0
                    ? ((day + night) / 2).toFixed(2)
                    : day > 0
                      ? day.toFixed(2)
                      : night > 0
                        ? night.toFixed(2)
                        : "0.00";
                })()}%
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

        {/* YARN SELECTION TABLE */}
        <div style={{ marginTop: "30px" }}>
          <h3 style={{ textAlign: "center" }}>Yarn Consumption</h3>
          <table border="1" style={{ margin: "0 auto", borderCollapse: "collapse", textAlign: "center" }} className="yarn-table">
            <thead style={{ backgroundColor: "#f2f2f2" }}>
              <tr>
                <th>Yarn Name</th>
                <th>Quantity (Bags/Kgs)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {selectedYarns.map((y, idx) => (
                <tr key={idx}>
                  <td>
                    <select
                      value={y.yarn_name}
                      onChange={(e) => handleYarnChange(idx, "yarn_name", e.target.value)}
                      style={{ width: "90%" }}
                    >
                      <option value="">Select Yarn</option>
                      {yarnList.map((item) => (
                        <option key={item._id} value={item.yarn_name}>
                          {item.yarn_name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={y.quantity}
                      onChange={(e) => handleYarnChange(idx, "quantity", e.target.value)}
                      placeholder="Qty"
                      style={{ width: "80px" }}
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => removeYarnRow(idx)}
                      style={{ color: "red", border: "none", background: "none", cursor: "pointer", border: "1px solid", padding: "0px 3px" }}
                    >
                      ✖
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <button onClick={addYarnRow} style={{ padding: "5px 15px", cursor: "pointer" }}>
              + Add Yarn
            </button>
          </div>
        </div>

        <div style={{
          marginTop: "30px",
          textAlign: "center"
        }}>

          <h3>Production Notes</h3>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter production notes..."
            rows="4"
            style={{
              width: "50%",
              padding: "10px",
              fontSize: "14px",
              resize: "vertical"
            }}
          />

        </div>

        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <button
            onClick={saveProduction}
            style={{
              marginLeft: "20px",
              padding: "10px 40px",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
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
