export const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

export const formatFullDate = (dateStr) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
};

export const createEmployee = (id, name, days, rate = 750) => ({
  id,
  name,
  dailySalary: Number(rate),
  attendance: Array(days).fill(""),
  totalPresent: 0,
  totalAbsent: 0,
  totalSalary: 0,
  advance: [], 
  totalAdvance: 0,
  finalPay: 0
});

// This is the EXACT CSS you provided, optimized for the print window
export const PRINT_STYLE = `
  body { font-family: 'Inter', sans-serif; color: black; }
  .slip-div { display: flex; align-items:center; justify-content: center; }
  .slip-header h2 { font-size: 32px; margin: 5px 0; text-align: center; }
  .slip-header .slip-subheader { display: flex; align-items: center; justify-content:center; gap: 5px; padding-bottom: 15px; }
  .slip-header .slip-subheader p{ margin: 0; font-weight:700; font-size: 16px; padding-top: 10px; }
  .slip-container { padding: 20px; border: 2px solid #000; width: 800px; background: white; }
  .slip-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  .slip-table td, .slip-table th { border: 1px solid #000; padding: 5px; text-align: left; }
  .net-pay-box { font-size:22px; border: 2px solid #000; padding: 10px; font-weight: bold; text-align: center; }
  .label { font-weight: bold; background: #f9f9f9; }
  .slip-adv-list { list-style: none; padding: 0; margin: 0; font-size: 11px; }
  .total-row { font-weight: bold; background: #eee; }
`;