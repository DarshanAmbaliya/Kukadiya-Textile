const express = require("express");
const router = express.Router();

const {
  addPurchase,
  getPurchases,
  getYarnPurchaseReport,
  updatePurchase,
  deletePurchase,
  getPurchaseById
} = require("../controllers/yarnPurchaseController");

// Report
router.get("/report", getYarnPurchaseReport);
router.get("/:id", getPurchaseById);
router.post("/", addPurchase);
router.put("/:id",updatePurchase);
router.delete("/:id",deletePurchase);

// Normal purchase list
router.get("/", getPurchases);

module.exports = router;