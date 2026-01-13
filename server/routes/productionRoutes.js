const express = require("express");
const router = express.Router();
const {
  createProduction,
  getProductionByMonth,
  getProductions,
  getProductionByYear
} = require("../controllers/productionController");

// GET all production data
router.get("/", getProductions);

// GET by month
router.get("/month", getProductionByMonth);

// SAVE production data
router.post("/", createProduction);

router.get('/:year', getProductionByYear);

module.exports = router;
