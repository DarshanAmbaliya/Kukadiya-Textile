// server/routes/employeeRoutes.js

const express = require('express');
const router = express.Router();

// Make sure these names MATCH exactly what is in your controller
const { 
  getEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee 
} = require('../controllers/employeeController');

// If any of the above are undefined, this line will throw the error you see
router.route('/')
  .get(getEmployees) 
  .post(createEmployee);

router.route('/:id')
  .put(updateEmployee)
  .delete(deleteEmployee);

module.exports = router;