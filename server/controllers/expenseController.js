const Expense = require('../models/Expense');
const ExpenseCategory = require('../models/ExpenseCategory');

// --- CATEGORY CONTROLLERS ---

// Add a new Category
exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = new ExpenseCategory({ name });
    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all Categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await ExpenseCategory.find();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Edit an existing Category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updatedCategory = await ExpenseCategory.findByIdAndUpdate(id, { name }, { new: true });
    res.status(200).json({ success: true, data: updatedCategory });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// --- EXPENSE CONTROLLERS ---

// Add an Expense item row
exports.addExpense = async (req, res) => {
  try {
    const { categoryId, amount, date, notes } = req.body;
    
    const expenseDate = new Date(date);
    const month = expenseDate.getMonth() + 1; // getMonth() is 0-indexed
    const year = expenseDate.getFullYear();

    const expense = new Expense({
      category: categoryId,
      amount,
      date: expenseDate,
      month,
      year,
      notes
    });

    await expense.save();
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get Expenses Monthly Wise (Flattened Category Name)
exports.getMonthlyExpenses = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ success: false, message: "Please provide both year and month parameters." });
    }

    // 1. Fetch data from MongoDB and populate the category relation
    const expenses = await Expense.find({ 
      year: parseInt(year), 
      month: parseInt(month) 
    }).populate('category', 'name');

    // 2. Calculate Total Expense
    const totalMonthlyExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

    // 3. Flatten the JSON structure so "name" is a direct property
    const cleanedData = expenses.map(item => {
      return {
        _id: item._id,
        name: item.category ? item.category.name : "Unknown Category", // Brings category name up to the main object
        amount: item.amount,
        notes: item.notes
      };
    });

    // 4. Return the custom structured response
    res.status(200).json({
      success: true,
      year: parseInt(year),
      month: parseInt(month),
      totalExpense: totalMonthlyExpense,
      data: cleanedData
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete an Expense item row
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the expense item by its ID
    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({ success: false, message: "Expense item not found." });
    }

    res.status(200).json({ success: true, message: "Expense deleted successfully.", data: deletedExpense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update an existing Expense item row
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, amount, date, notes } = req.body;

    const expenseDate = new Date(date);
    const month = expenseDate.getMonth() + 1;
    const year = expenseDate.getFullYear();

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      {
        category: categoryId,
        amount,
        date: expenseDate,
        month,
        year,
        notes
      },
      { new: true } // Returns the newly modified object
    );

    if (!updatedExpense) {
      return res.status(404).json({ success: false, message: "Expense row not found." });
    }

    res.status(200).json({ success: true, data: updatedExpense });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};