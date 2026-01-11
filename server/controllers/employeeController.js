const Payroll = require('../models/Employee');

// GET: Fetch all data as { "2026": { "january": [], "february": [] } }
exports.getEmployees = async (req, res) => {
  try {
    const data = await Payroll.find();
    const result = {};
    data.forEach(item => {
      result[item.year] = item.months;
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST: Save or Update a specific month's data
exports.createEmployee = async (req, res) => {
  const { year, month, employees } = req.body; 
  try {
    let payroll = await Payroll.findOne({ year });
    if (!payroll) {
      payroll = new Payroll({ year, months: {} });
    }
    // Set the specific month key (e.g. "january") with the full array
    payroll.months.set(month.toLowerCase(), employees);
    const saved = await payroll.save();
    res.status(200).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Dummy exports to prevent Route errors if you kept them in employeeRoutes.js
exports.updateEmployee = (req, res) => res.status(200).send();
exports.deleteEmployee = (req, res) => res.status(200).send();