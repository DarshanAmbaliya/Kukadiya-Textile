const Fabric = require("../models/Fabric")

exports.getFabrics = async (req, res) => {
  try {
    const data = await Fabric.find();
    res.status(200).json(data);
  }
  catch (err) {
    res.status(400).json({ message: err.message });
  }
}

exports.createFabric = async (req, res) => {
  const { fabricName } = req.body

  if (!fabricName) {
    return res.status(400).json({ message: "fabricName is required" });
  }

  try {
    let fabric = await Fabric.findOne({ fabric_name: fabricName })

    if (fabric) {
      return res.status(409).json({ message: "Fabric already exists" })
    }

    const newFabric = new Fabric({
      fabric_name: fabricName
    });

    const savedFabric = await newFabric.save();
    res.status(201).json(savedFabric);

  }
  catch (err) {
    res.status(400).json({ message: err.message });
  }
}

exports.updateFabric = async (req, res) => {

  const { id } = req.params;
  const { fabricName } = req.body;

  if (!fabricName) {
    return res.status(400).json({
      message: "fabricName is required"
    });
  }

  try {
    const fabric = await Fabric.findById(id);

    if (!fabric) {
      return res.status(404).json({
        message: "Fabric not found"
      });
    }

    // duplicate check
    const exists = await Fabric.findOne({
      fabric_name: fabricName,
      _id: { $ne: id }
    });

    if (exists) {
      return res.status(409).json({
        message: "Fabric already exists"
      });
    }

    fabric.fabric_name = fabricName;
    const updatedFabric = await fabric.save();

    res.status(200).json({
      message: "Fabric updated successfully",
      data: updatedFabric
    });
  }
  catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
}

// DELETE FABRIC
exports.deleteFabric = async (req, res) => {

  try {

    const { id } = req.params;
    const fabric = await Fabric.findByIdAndDelete(id);

    if (!fabric) {
      return res.status(404).json({
        message: "Fabric not found"
      })
    }

    res.status(200).json({
      message: "Fabric deleted successfully"
    })
  }
  catch (err) {

    res.status(400).json({
      message: err.message
    });

  }

}