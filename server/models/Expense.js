const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpenseCategory', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true }, // For fine-grained filtering
  month: { type: Number, required: true }, // 1 for Jan, 2 for Feb, etc.
  year: { type: Number, required: true },  // e.g., 2026
  notes: { type: String } // Optional details
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);