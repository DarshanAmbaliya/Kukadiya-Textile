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