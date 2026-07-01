const express = require("express");
const router = express.Router();

const {
    getFabrics,
    createFabric,
    updateFabric,
    deleteFabric
} = require("../controllers/fabricController");


router.get("/", getFabrics);
router.post("/", createFabric);

// EDIT QUALITY
router.put("/:id", updateFabric);

// DELETE QUALITY
router.delete("/:id", deleteFabric);

module.exports = router;