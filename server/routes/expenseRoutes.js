const express = require('express');
const router = express.Router();
const { 
  addCategory, 
  getCategories, 
  updateCategory, 
  addExpense, 
  getMonthlyExpenses,
  deleteExpense,
  updateExpense
} = require('../controllers/expenseController');

// Category Routes
router.post('/categories', addCategory);
router.get('/categories', getCategories);
router.put('/categories/:id', updateCategory);

// Expense Records Routes
router.post('/', addExpense);
router.get('/monthly', getMonthlyExpenses);
router.delete('/:id', deleteExpense);
router.put('/:id', updateExpense);

module.exports = router;