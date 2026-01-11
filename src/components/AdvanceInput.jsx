import React, { useState } from 'react';
import { formatFullDate } from '../utils/payrollHelpers';

export default function AdvanceInput({ disabled, onAdd }) {
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");

  const add = () => {
    if (!date || amount <= 0) return;
    onAdd(formatFullDate(date), amount);
    setDate(""); setAmount("");
  };

  return (
    <div className="advance-input-group">
      <input type="date" disabled={disabled} value={date} onChange={e => setDate(e.target.value)} />
      <input type="number" placeholder="₹" disabled={disabled} value={amount} onChange={e => setAmount(e.target.value)} />
      <button className="add-btn" disabled={disabled} onClick={add}>+</button>
    </div>
  );
}