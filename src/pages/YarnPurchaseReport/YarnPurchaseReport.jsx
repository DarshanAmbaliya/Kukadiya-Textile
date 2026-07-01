import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";

const YarnPurchaseReport = () => {
  const navigate = useNavigate();
  const [yarns, setYarns] = useState([]);
  const [rows, setRows] = useState([]);
  const [footer, setFooter] = useState({});

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const [loading, setLoading] = useState(false);

  const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://kukadiya-textile.onrender.com";

  useEffect(() => {
    fetchReport();
  }, [year, month]);

  const fetchReport = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE_URL}/api/yarn-purchase/report?year=${year}&month=${month}`
      );

      setYarns(res.data.yarns || []);
      setRows(res.data.rows || []);
      setFooter(res.data.footer || {});
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="yarn-purchase-section"
      style={{
        padding: 20,
        background: "#f5f6fa",
        minHeight: "100vh",
      }}
    >
      <h2>Yarn Purchase Report</h2>

      {/* FILTER */}

      <div className="box" style={{
        display: "flex",flex: "wrap", justifyContent: "space-between", background: "white", marginBottom: 20, padding: 15,
        borderRadius: 8,
        alignItems: "center"
      }}>
        <div className="filter-control"
          style={{
            display: "flex",
            gap: 15,
          }}
        >
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 5,
            }}
          >
            {[2026, 2027, 2028].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 5,
            }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", {
                  month: "long",
                })}
              </option>
            ))}
          </select>
        </div>
        <div className="btn">
          <NavLink to="/yarn-purchase" style={{ background: "#28a745", color: "#ffffff", border: "none", padding: "8px 16px", fontSize: "14px", fontWeight: "600", borderRadius: "4px", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)",textDecoration: "none" }}>Add Yarn Purchase</NavLink>
        </div>
      </div>

      {loading ? (
        <h3>Loading...</h3>
      ) : (
        <div
          style={{
            overflowX: "auto",
            background: "#fff",
            borderRadius: 10,
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "center",
            }}
          >
            <thead>
              {/* First Header Row */}
              <tr style={{ background: "#1976d2", color: "#fff" }}>
                <th style={{
                  ...thStyle,
                  position: "sticky",
                  left: 0,
                  zIndex: 5,
                }} rowSpan={2}>Purchase Date</th>

                {yarns.map((yarn) => (
                  <th key={yarn._id} style={thStyle} colSpan={2}>
                    {yarn.yarn_name}
                  </th>
                ))}
              </tr>

              {/* Second Header Row for Sub-columns */}
              <tr style={{ background: "#2c3e50", color: "#fff" }}>
                {yarns.map((yarn) => (
                  <React.Fragment key={`sub-${yarn._id}`}>
                    <th style={thSubStyle}>Rate</th>
                    <th style={thSubStyle}>Weight</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row._id}>
                  <td style={{
                    ...tdStyle,
                    ...stickyColumnStyle,
                    background: "white"
                  }}>
                    {new Date(row.purchaseDate).toLocaleDateString("en-GB")}
                  </td>

                  {yarns.map((yarn) => {
                    const item = row.values[yarn._id];

                    return item ? (
                      <React.Fragment key={yarn._id}>
                        <td style={tdStyle}>
                          {item ? (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <span style={{ fontWeight: "600" }}>
                                ₹ {item.price}
                              </span>

                              <div
                                style={{
                                  display: "flex",
                                  gap: 4,
                                }}
                              >
                                <button
                                  onClick={() =>
                                    navigate(`/yarn-purchase/edit/${item._id}`)
                                  }
                                  style={{
                                    background: "#1976d2",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 4,
                                    padding: "3px 8px",
                                    cursor: "pointer",
                                    fontSize: 12,
                                  }}
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={async () => {
                                    if (window.confirm("Delete this purchase?")) {
                                      await axios.delete(
                                        `${API_BASE_URL}/api/yarn-purchase/${item._id}`
                                      );
                                      fetchReport();
                                    }
                                  }}
                                  style={{
                                    background: "#d32f2f",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 4,
                                    padding: "3px 8px",
                                    cursor: "pointer",
                                    fontSize: 12,
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td style={tdStyle}>{item.weight} Kg</td>
                      </React.Fragment>
                    ) : (
                      <React.Fragment key={yarn._id}>
                        <td style={tdStyle}>-</td>
                        <td style={tdStyle}>-</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr style={{ background: "#eee", fontWeight: "bold" }}>
                <td style={{
                  ...tdStyle,
                  ...stickyColumnStyle,
                  background: "#eee"
                }}>Total Weight</td>
                {yarns.map((yarn) => (
                  <React.Fragment key={`total-${yarn._id}`}>
                    <td style={tdStyle} colSpan={2}>
                      {footer[yarn._id] ? footer[yarn._id].totalWeight : 0} Kg
                    </td>
                  </React.Fragment>
                ))}
                <td></td>
              </tr>

              <tr style={{ background: "#eee", fontWeight: "bold" }}>
                <td style={{
                  ...tdStyle,
                  ...stickyColumnStyle,
                  background: "#eee"
                }}>Average Price/Kg</td>
                {yarns.map((yarn) => (
                  <React.Fragment key={`avg-${yarn._id}`}>
                    <td style={tdStyle} colSpan={2}>
                      ₹ {footer[yarn._id] ? footer[yarn._id].avgPrice : 0}
                    </td>
                  </React.Fragment>
                ))}
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

const thStyle = {
  padding: 12,
  border: "1px solid #ddd",
  background: "#2c3e50"
};

const tdStyle = {
  padding: 5,
  border: "1px solid #ddd",
};

const thSubStyle = {
  padding: 8,
  border: "1px solid #ddd",
  background: "#34495e",
  fontSize: "12px"
};

const stickyColumnStyle = {
  position: "sticky",
  left: 0,
  zIndex: 2,
  minWidth: "140px",
};

export default YarnPurchaseReport;
