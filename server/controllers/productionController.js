const Production = require("../models/Production");

// SAVE / UPDATE production (year → month → date)
const createProduction = async (req, res) => {
  try {
    const data = req.body;

    const yearKey = Object.keys(data)[0];
    const monthKey = Object.keys(data[yearKey])[0];
    const dateKey = Object.keys(data[yearKey][monthKey])[0];

    const dayData = data[yearKey][monthKey][dateKey];
    const updatePath = `${monthKey}.${dateKey}`;

    const result = await Production.findOneAndUpdate(
      { year: Number(yearKey) },
      {
        $set: {
          [updatePath]: {
            summary: dayData.summary,
            operator_data: dayData.operator_data
          }
        }
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: "Production saved successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET production by month (YYYY-MM)
const getProductionByMonth = async (req, res) => {
  try {
    const { month } = req.query; // format: "YYYY-MM"
    if (!month) return res.status(400).json({ message: "Month is required" });

    const [yearStr, monthStr] = month.split("-");
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1;

    const months = [
      "january","february","march","april","may","june",
      "july","august","september","october","november","december"
    ];

    const monthName = months[monthIndex];

    // Find the year document
    const yearData = await Production.findOne({ year });
    if (!yearData || !yearData[monthName]) {
      return res.json([]);
    }

    const monthData = yearData[monthName]; // Map of dates
    const result = [];

    // Flatten month data into machine-wise array
    for (let [date, dayData] of monthData.entries()) {
      dayData.operator_data.forEach(op => {
        op.machine_production.forEach(m => {
          result.push({
            date,
            machineNumber: m.machineNumber,
            quality: m.quality,
            dayMeter: op.shift === "Day" ? m.meter : 0,
            nightMeter: op.shift === "Night" ? m.meter : 0,
            dayEff: op.shift === "Day" ? m.efficiency : 0,
            nightEff: op.shift === "Night" ? m.efficiency : 0,
            bimBalance: m.bimBalance,
            pick: m.pick
          });
        });
      });
    }

    res.json(monthData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// GET all production data (for testing / reports)
const getProductions = async (req, res) => {
  try {
    const data = await Production.find().sort({ year: 1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET production by Year (handles /api/production/:year)
const getProductionByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const data = await Production.findOne({ year: Number(year) });
    
    if (!data) {
      return res.status(404).json({ message: "No data found for this year" });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduction,
  getProductionByMonth,
  getProductions,
  getProductionByYear
};
