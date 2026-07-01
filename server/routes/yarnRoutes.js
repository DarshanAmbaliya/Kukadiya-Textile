const express = require("express");
const router = express.Router();
const {
  getYarns,
  createYarn,
  deleteYarn,
  updateYarn,
} = require("../controllers/yarnController");

router.get("/", getYarns);
router.post("/", createYarn);
router.delete("/:id", deleteYarn); 
router.put("/:id", updateYarn);

module.exports = router;