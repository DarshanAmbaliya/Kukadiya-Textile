import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import "./Expense.css";

const Expense = () => {
  const [searchParams] = useSearchParams();

  const paramYear = searchParams.get("year");
  const paramMonth = searchParams.get("month");

  const initialMonthStr = (paramYear && paramMonth)
    ? `${paramYear}-${paramMonth.padStart(2, "0")}`
    : new Date().toISOString().slice(0, 7);

  const [selectedMonth, setSelectedMonth] = useState(initialMonthStr);

  // Data States
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);

  // Form Management States
  const [newCategory, setNewCategory] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  // Track if we are editing an expense row
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  const [expenseForm, setExpenseForm] = useState({
    categoryId: "",
    amount: "",
    notes: "",
    date: (paramYear && paramMonth)
      ? `${paramYear}-${paramMonth.padStart(2, "0")}-01`
      : new Date().toISOString().slice(0, 10),
  });

  const API_BASE_URL = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://kukadiya-textile.onrender.com";

  useEffect(() => {
    fetchCategories();
    fetchMonthlyExpenses();
  }, [selectedMonth]);

  // --- API CALLS ---

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/expenses/categories`);
      if (res.data.success) setCategories(res.data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchMonthlyExpenses = async () => {
    try {
      const [year, month] = selectedMonth.split("-");
      const res = await axios.get(
        `${API_BASE_URL}/api/expenses/monthly?year=${parseInt(year)}&month=${parseInt(month)}`
      );
      if (res.data.success) {
        setExpenses(res.data.data);
        setTotalExpense(res.data.totalExpense);
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setExpenses([]);
      setTotalExpense(0);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/api/expenses/categories`, { name: newCategory });
      if (res.data.success) {
        setNewCategory("");
        fetchCategories();
      }
    } catch (err) {
      console.error("Error adding category:", err);
    }
  };

  const handleUpdateCategory = async (id) => {
    if (!editingCategoryName.trim()) return;
    try {
      const res = await axios.put(`${API_BASE_URL}/api/expenses/categories/${id}`, { name: editingCategoryName });
      if (res.data.success) {
        setEditingCategoryId(null);
        setEditingCategoryName("");
        fetchCategories();
        fetchMonthlyExpenses();
      }
    } catch (err) {
      console.error("Error updating category:", err);
    }
  };

  // Dual Purpose: Handles both Adding and Updating a Row
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    const { categoryId, amount, date, notes } = expenseForm;
    if (!categoryId || !amount) {
      alert("Please select a category and fill in the amount.");
      return;
    }

    try {
      if (editingExpenseId) {
        // --- UPDATE MODE ---
        const res = await axios.put(`${API_BASE_URL}/api/expenses/${editingExpenseId}`, {
          categoryId,
          amount: Number(amount),
          date,
          notes,
        });

        if (res.data.success) {
          setEditingExpenseId(null);
          fetchMonthlyExpenses();
        }
      } else {
        // --- ADD MODE ---
        const res = await axios.post(`${API_BASE_URL}/api/expenses`, {
          categoryId,
          amount: Number(amount),
          date,
          notes,
        });

        if (res.data.success) {
          fetchMonthlyExpenses();
        }
      }

      // Reset Form State back to default
      setExpenseForm({
        categoryId: "",
        amount: "",
        notes: "",
        date: expenseForm.date,
      });

    } catch (err) {
      console.error("Error saving expense:", err);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense record?")) {
      try {
        const res = await axios.delete(`${API_BASE_URL}/api/expenses/${id}`);
        if (res.data.success) {
          fetchMonthlyExpenses();
        }
      } catch (err) {
        console.error("Error deleting expense:", err);
      }
    }
  };

  // Populates the form fields with existing row data for editing
  const startEditExpense = (row) => {
    setEditingExpenseId(row._id);

    // Find matching category ID from name string
    const matchingCategory = categories.find(c => c.name === row.name);

    setExpenseForm({
      categoryId: matchingCategory ? matchingCategory._id : "",
      amount: row.amount,
      notes: row.notes || "",
      // Form date safely defaults or falls back to current local string
      date: row.date ? row.date.slice(0, 10) : new Date().toISOString().slice(0, 10)
    });
  };

  const cancelExpenseEdit = () => {
    setEditingExpenseId(null);
    setExpenseForm((prev) => ({
      categoryId: "",
      amount: "",
      notes: "",
      date: prev.date,
    }));
  };

  return (
    <section className="production-report-section expense-section">
      <div className="container">
        <div className="row">
          <h2>Expense Management Ledger</h2>

          {/* --- TOP MANAGEMENT FILTERS & ACTIONS --- */}
          <div className="filter-controls" style={{ gap: "20px", flexWrap: "wrap" }}>
            <div className="filter-menu">
              <label><strong>Select Month: </strong></label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>

            <div className="filter-menu">
              <form onSubmit={handleAddCategory} style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="New Category Name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <button type="submit" style={{ cursor: "pointer", "background": "rgb(40, 167, 69)", "color": "white" }}>+ Add Category</button>
              </form>
            </div>
          </div>

          {/* --- DYNAMIC EXPENSE TRANSACTION FORM --- */}
          <div className="filter-controls" style={{ marginTop: "15px", background: editingExpenseId ? "#fff3cd" : "#fdfdfd", padding: "15px", borderRadius: "6px", border: editingExpenseId ? "1px solid #ffeeba" : "1px solid #ddd" }}>
            <form onSubmit={handleExpenseSubmit} style={{ display: "flex", gap: "15px", flexWrap: "wrap", width: "100%", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: "150px" }}>
                <label style={{ display: "block", fontSize: "12px" }}><b>Category:</b></label>
                <select
                  value={expenseForm.categoryId}
                  onChange={(e) => setExpenseForm({ ...expenseForm, categoryId: e.target.value })}
                  style={{ width: "100%", padding: "5px" }}
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1, minWidth: "120px" }}>
                <label style={{ display: "block", fontSize: "12px" }}><b>Amount (₹):</b></label>
                <input
                  type="number"
                  placeholder="Amount"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  style={{ width: "100%", padding: "5px" }}
                />
              </div>

              <div style={{ flex: 1, minWidth: "130px" }}>
                <label style={{ display: "block", fontSize: "12px" }}><b>Date:</b></label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  style={{ width: "100%", padding: "5px" }}
                />
              </div>

              <div style={{ flex: 2, minWidth: "180px" }}>
                <label style={{ display: "block", fontSize: "12px" }}><b>Notes:</b></label>
                <input
                  type="text"
                  placeholder="Optional details..."
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  style={{ width: "100%", padding: "5px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", alignSelf: "flex-end" }}>
                <button type="submit" style={{ cursor: "pointer", padding: "6px 20px", background: editingExpenseId ? "#ffc107" : "#28a745", color: editingExpenseId ? "#000" : "#fff", border: "none", borderRadius: "4px" }}>
                  {editingExpenseId ? "Update Expense" : "Add Row Expense"}
                </button>
                {editingExpenseId && (
                  <button type="button" onClick={cancelExpenseEdit} style={{ cursor: "pointer", padding: "6px 15px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "4px" }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* --- EXPENSE LEDGER TABLE COMPONENT --- */}
          <div className="production-data" style={{ overflowX: "auto", marginTop: "20px" }}>
            <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%", textAlign: "center" }}>
              <thead style={{ background: "#eee" }}>
                <tr>
                  <th>No.</th>
                  <th>Expense Category Name</th>
                  <th>Description / Notes</th>
                  <th>Actions</th>
                  <th>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length > 0 ? (
                  expenses.map((row, index) => (
                    <tr key={row._id} style={{ background: editingExpenseId === row._id ? "#fff9e6" : "transparent" }}>
                      <td>{index + 1}</td>
                      <td style={{ fontWeight: "bold" }}>{row.name}</td>
                      <td style={{ fontStyle: "italic", color: "#666" }}>{row.notes || "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                          <button
                            onClick={() => startEditExpense(row)}
                            style={{ background: "#007bff", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(row._id)}
                            style={{ background: "#dc3545", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "30px", fontWeight: "bold" }}>
                        {row.amount.toLocaleString("en-IN")}/-
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No expenses recorded for this month.</td>
                  </tr>
                )}
              </tbody>
              <tfoot style={{ background: "#e9ecef", fontWeight: "bold" }}>
                <tr>
                  <td colSpan="4" style={{ textAlign: "right", paddingRight: "20px" }}>Total Month Expense:</td>
                  <td style={{ textAlign: "right", paddingRight: "30px", fontWeight: "bold" }}>
                    {totalExpense.toLocaleString("en-IN")}/-
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* --- EDIT / INLINE CATEGORY LIST UPDATER --- */}
          <div style={{ marginTop: "40px", background: "#f8f9fa", padding: "15px", borderRadius: "5px" }}>
            <h3>Manage & Edit Categories</h3>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {categories.map((cat) => (
                <li key={cat._id} className="category-pill">
                  {editingCategoryId === cat._id ? (
                    <div className="category-edit-group">
                      <input
                        type="text"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        className="category-edit-input"
                      />
                      <button onClick={() => handleUpdateCategory(cat._id)} className="btn-action btn-save">Save</button>
                      <button onClick={() => setEditingCategoryId(null)} className="btn-action btn-cancel">Cancel</button>
                    </div>
                  ) : (
                    <>
                      <span className="category-name">{cat.name}</span>
                      <button onClick={() => { setEditingCategoryId(cat._id); setEditingCategoryName(cat.name); }} className="btn-edit-pill">Edit</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Expense;