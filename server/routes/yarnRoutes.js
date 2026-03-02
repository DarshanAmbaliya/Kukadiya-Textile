const express = require("express");
const router = express.Router();
const {
  getYarns,
  createYarn,
  deleteYarn,
} = require("../controllers/yarnController");

router.get("/", getYarns);
router.post("/", createYarn);
router.delete("/:id", deleteYarn); 

module.exports = router;