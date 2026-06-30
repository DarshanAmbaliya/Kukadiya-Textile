const YarnPurchase = require("../models/YarnPurchase");

exports.addPurchase = async (req, res) => {
  try {
    const { yarnId, purchaseDate, weight, price } = req.body;

    const date = new Date(purchaseDate);

    const purchase = new YarnPurchase({
      yarnId,
      purchaseDate,
      weight,
      price,
      totalAmount: weight * price,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    });

    await purchase.save();

    res.status(201).json({
      success: true,
      message: "Purchase Added",
      purchase,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getPurchases = async (req, res) => {
  try {

    const { month, year } = req.query;

    let filter = {};

    if (month)
      filter.month = Number(month);

    if (year)
      filter.year = Number(year);

    const purchases = await YarnPurchase.find(filter)
      .populate("yarnId")
      .sort({ purchaseDate: -1 });

    res.json(purchases);

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
};

exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await YarnPurchase.findById(req.params.id)
      .populate("yarnId");
    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found"
      });
    }
    res.json(purchase);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

exports.getYarnPurchaseReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    let filter = {};

    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);

    const purchases = await YarnPurchase.find(filter)
      .populate("yarnId", "yarn_name")
      .sort({
        purchaseDate: 1,
        createdAt: 1,
      });

    // ===============================
    // Dynamic Yarn List
    // ===============================
    const yarnMap = {};

    purchases.forEach((item) => {
      if (item.yarnId) {
        yarnMap[item.yarnId._id.toString()] = {
          _id: item.yarnId._id,
          yarn_name: item.yarnId.yarn_name,
        };
      }
    });

    const yarns = Object.values(yarnMap);

    // ===============================
    // Group Rows
    // ===============================
    const dateGroups = {};

    purchases.forEach((item) => {
      const date = item.purchaseDate.toISOString().split("T")[0];
      const yarnId = item.yarnId._id.toString();

      if (!dateGroups[date]) {
        dateGroups[date] = [];
      }

      let placed = false;

      // Find row where this yarn is not already present
      for (const row of dateGroups[date]) {
        if (!row.values[yarnId]) {
          row.values[yarnId] = {
            _id: item._id,
            price: item.price,
            weight: item.weight,
            totalAmount: item.totalAmount,
          };

          placed = true;
          break;
        }
      }

      // Create new row if every row already has this yarn
      if (!placed) {
        dateGroups[date].push({
          _id: item._id,
          purchaseDate: date,
          values: {
            [yarnId]: {
              _id: item._id,
              price: item.price,
              weight: item.weight,
              totalAmount: item.totalAmount,
            },
          },
        });
      }
    });

    const rows = Object.values(dateGroups).flat();

    // ===============================
    // Footer
    // ===============================
    const footer = {};

    yarns.forEach((yarn) => {
      const data = purchases.filter(
        (item) =>
          item.yarnId &&
          item.yarnId._id.toString() === yarn._id.toString()
      );

      const totalWeight = data.reduce(
        (sum, item) => sum + Number(item.weight),
        0
      );

      const totalAmount = data.reduce(
        (sum, item) => sum + Number(item.totalAmount),
        0
      );

      footer[yarn._id] = {
        totalWeight,
        totalAmount,
        avgPrice:
          totalWeight > 0
            ? (totalAmount / totalWeight).toFixed(2)
            : "0.00",
      };
    });

    res.status(200).json({
      success: true,
      yarns,
      rows,
      footer,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      yarnId,
      purchaseDate,
      weight,
      price
    } = req.body;
    const date = new Date(purchaseDate);
    const updated = await YarnPurchase.findByIdAndUpdate(
      id,
      {
        yarnId,
        purchaseDate,
        weight,
        price,
        totalAmount: Number(weight) * Number(price),
        month: date.getMonth() + 1,
        year: date.getFullYear()
      },
      {
        new: true
      }
    );

    res.json({
      success: true,
      message: "Purchase Updated",
      updated
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

exports.deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    await YarnPurchase.findByIdAndDelete(id);
    res.json({
      success: true,
      message: "Purchase Deleted"
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};