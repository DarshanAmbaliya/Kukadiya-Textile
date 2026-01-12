const Payroll = require('../models/Employee');

// GET: Fetch all payroll data
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

  if (!year || !month) {
    return res.status(400).json({ message: "Year and Month are required" });
  }

  try {
    let payroll = await Payroll.findOne({ year: parseInt(year) });

    if (!payroll) {
      payroll = new Payroll({ year: parseInt(year), months: {} });
    }

    // Set the specific month (e.g., "january") in the Map
    payroll.months.set(month.toLowerCase(), employees);
    
    // Tell Mongoose the Map data has changed
    payroll.markModified('months');

    const saved = await payroll.save();
    res.status(200).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Placeholders for update/delete
exports.updateEmployee = (req, res) => res.status(200).json({ message: "Update success" });
exports.deleteEmployee = (req, res) => res.status(200).json({ message: "Delete success" });