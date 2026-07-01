const Yarn = require("../models/Yarn");

exports.getYarns = async (req, res) => {
  try {
    const data = await Yarn.find();
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.createYarn = async (req, res) => {
  const { yarnName } = req.body;

  if (!yarnName) {
    return res.status(400).json({ message: "yarnName is required" });
  }

  try {
    let yarn = await Yarn.findOne({ yarn_name: yarnName });

    if (yarn) {
      return res.status(409).json({ message: "Yarn quality already exists" });
    }

    const newYarn = new Yarn({
      yarn_name: yarnName,
    });

    const savedYarn = await newYarn.save();
    res.status(201).json(savedYarn);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE YARN
exports.deleteYarn = async (req, res) => {
  try {
    const yarn = await Yarn.findByIdAndDelete(req.params.id);

    if (!yarn) {
      return res.status(404).json({ message: "Yarn quality not found" });
    }

    res.status(200).json({ message: "Yarn quality deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE YARN
exports.updateYarn = async (req, res) => {
  const { yarnName } = req.body;

  if (!yarnName) {
    return res.status(400).json({
      message: "yarnName is required"
    });
  }

  try {

    const yarn = await Yarn.findById(req.params.id);

    if (!yarn) {
      return res.status(404).json({
        message: "Yarn quality not found"
      });
    }


    const exists = await Yarn.findOne({
      yarn_name: yarnName,
      _id: { $ne: req.params.id }
    });


    if (exists) {
      return res.status(409).json({
        message: "Yarn quality already exists"
      });
    }


    yarn.yarn_name = yarnName;

    const updatedYarn = await yarn.save();

    res.status(200).json({
      message: "Yarn updated successfully",
      data: updatedYarn
    });


  } catch(err) {

    res.status(400).json({
      message: err.message
    });

  }
};