import React from "react";

export default function SalarySlip({ emp, month, year }) {
  // 1. Safety Guard: If emp data is missing, return a message instead of crashing
  if (!emp) {
    return <div style={{ padding: "20px", color: "red" }}>Error: No Employee Data Found</div>;
  }

  // 2. Safe ID Formatting: Handle potential undefined IDs
  const fullID = emp?._id ? emp._id.toString() : "0000";
  const shortID = fullID.substring(0, 3).toUpperCase();
  const displayID = `${emp.name?.toUpperCase() || "EMP"}-${shortID}`;

  // 3. Calculation Fallbacks
  const dailyRate = emp.dailySalary || 0;
  const presentDays = emp.totalPresent || 0;
  const earnings = emp.totalSalary || (presentDays * dailyRate);
  const deductions = emp.totalAdvance || 0;
  const netPay = emp.finalPay || (earnings - deductions);

  return (
    <div className="slip-div">
      <div className="slip-container">

        {/* --- Header --- */}
        <div className="slip-header">
          <h2>KUKADIYA TEXTILE</h2>
          <div className="slip-subheader">
            <p>PAYSLIP</p>
            <p>{month?.toUpperCase()} {year}</p>
          </div>
        </div>

        {/* --- Employee Info Table --- */}
        <table className="slip-table">
          <tbody>
            <tr>
              <td className="label">Employee Name:</td>
              <td className="value" style={{ fontWeight: 'bold', fontSize: '14px' }}>
                {emp.name || "N/A"}
              </td>
              <td className="label">Employee ID:</td>
              <td className="value">{displayID}</td>
            </tr>
            <tr>
              <td className="label">Daily Rate:</td>
              <td className="value">₹{dailyRate}</td>
              <td className="label">Days Present:</td>
              <td className="value" style={{ color: "green", fontWeight: "bold" }}>
                {presentDays}
              </td>
            </tr>
            <tr>
              <td className="label">Month:</td>
              <td className="value">{month}</td>
              <td className="label">Days Absent:</td>
              <td className="value" style={{ color: "red" }}>
                {emp.totalAbsent || 0}
              </td>
            </tr>
          </tbody>
        </table>

        {/* --- Earnings & Deductions Table --- */}

        <table className="slip-table main-details">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Earnings Description</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ textAlign: 'left' }}>Deductions (Advances)</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'top', height: '120px' }}>
                <div style={{ fontWeight: 'bold' }}>Basic Salary</div>
                <div style={{ fontSize: '11px', color: '#555' }}>
                  ({presentDays} Days × ₹{dailyRate})
                </div>
              </td>
              <td style={{ verticalAlign: 'top', textAlign: 'right', fontWeight: 'bold' }}>
                ₹{earnings}
              </td>
              <td style={{ verticalAlign: 'top' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {emp.advance && emp.advance.length > 0 ? (
                    emp.advance.map((obj, idx) => {
                      const entries = Object.entries(obj);
                      if (entries.length === 0) return null;
                      const [date, amt] = entries[0];
                      return (
                        <li key={idx} style={{ fontSize: '11px', borderBottom: '1px dashed #ccc', marginBottom: '2px' }}>
                          {date}: <span style={{ float: 'right' }}>₹{amt}</span>
                        </li>
                      );
                    })
                  ) : (
                    <li style={{ fontSize: '11px', color: '#888' }}>No advances recorded</li>
                  )}
                </ul>
              </td>
              <td style={{ verticalAlign: 'top', textAlign: 'right', fontWeight: 'bold' }}>
                ₹{deductions}
              </td>
            </tr>
            <tr style={{ background: '#f9f9f9', fontWeight: 'bold' }}>
              <td>Gross Total Earnings</td>
              <td style={{ textAlign: 'right' }}>₹{earnings}</td>
              <td>Total Deductions</td>
              <td style={{ textAlign: 'right' }}>₹{deductions}</td>
            </tr>
          </tbody>
        </table>

        {/* --- Net Pay Section --- */}
        <div className="net-pay-section">
          <div className="net-pay-box">
            <span style={{ fontSize: '16px' }}>NET PAYABLE:</span>
            <span style={{ marginLeft: '15px', fontSize: '24px' }}>₹ {netPay}</span>
          </div>
          <p style={{ fontSize: '11px', fontStyle: 'italic', marginTop: '5px', textAlign: 'right' }}>
            Amount in words: Rupees {netPay} only
          </p>
        </div>

        {/* --- Signature Section --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', padding: '0 20px' }}>
          <div style={{ borderTop: '1px solid #000', width: '180px', textAlign: 'center', fontSize: '12px', paddingTop: '5px' }}>
            Employee Signature
          </div>
          <div style={{ borderTop: '1px solid #000', width: '180px', textAlign: 'center', fontSize: '12px', paddingTop: '5px' }}>
            Manager/Authorized Sign
          </div>
        </div>

      </div>
    </div>
  );
}