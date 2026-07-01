const express = require("express");

const router = express.Router();

const {
  login,
  createUser,
  resetPassword,
  getUsers,
} = require("../controllers/authController");

router.post("/login", login);
router.post("/register", createUser);
router.post("/reset-password", resetPassword);
router.get("/users", getUsers);

module.exports = router;