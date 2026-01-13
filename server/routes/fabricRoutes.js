const express = require("express");
const router = express.Router();
const { getFabrics, createFabric } = require("../controllers/fabricController");

// Route to get all fabrics
// GET /api/fabrics
router.get("/", getFabrics);

// Route to create a new fabric
// POST /api/fabrics
router.post("/", createFabric);

module.exports = router;