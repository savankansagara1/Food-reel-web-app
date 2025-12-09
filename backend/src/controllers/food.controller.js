const foodModel = require("../models/food.model.js");
const storageService = require("../services/storage.service.js");
const { v4: uuidv4 } = require("uuid");
const likeModel = require("../models/likes.model.js");
const saveModel = require("../models/save.model.js");

async function createFood(req, res) {
  const fileUploadResult = await storageService.uploadFile(
    req.file.buffer,
    uuidv4()
  );

  const foodItem = await foodModel.create({
    name: req.body.name,
    description: req.body.description,
    video: fileUploadResult.url,
    foodPartner: req.foodPartner._id,
  });
  res.status(201).json({ message: "Food item created", foodItem });
}

async function getFoodItems(req, res) {
  const foodItems = await foodModel.find();
  res.status(200).json({ message: "Food items fetched successfully", foodItems });
}

async function likeFood(req, res) {
  try {
    const { foodId } = req.body || {};
    const userId = req.user?._id;

    if (!userId) return res.status(401).json({ message: "please login first" });
    if (!foodId) return res.status(400).json({ message: "foodId is required" });

    const food = await foodModel.findById(foodId).select("_id likeCount");
    if (!food) return res.status(404).json({ message: "Food not found" });

    const existing = await likeModel.findOne({ user: userId, food: foodId });

    if (existing) {
      await likeModel.deleteOne({ _id: existing._id });
      const updated = await foodModel.findByIdAndUpdate(
        foodId,
        { $inc: { likeCount: -1 } },
        { new: true, select: "likeCount" }
      );
      return res.status(200).json({
        message: "Food item unliked successfully",
        like: false,
        likeCount: Math.max(0, updated?.likeCount ?? 0),
      });
    } else {
      await likeModel.create({ user: userId, food: foodId });
      const updated = await foodModel.findByIdAndUpdate(
        foodId,
        { $inc: { likeCount: 1 } },
        { new: true, select: "likeCount" }
      );
      return res.status(201).json({
        message: "Food item liked successfully",
        like: true,
        likeCount: Math.max(0, updated?.likeCount ?? 0),
      });
    }
  } catch (err) {
    console.error("likeFood error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function saveFood(req, res) {
  try {
    const userId = req.user?._id;
    const { foodId } = req.body || {};
    if (!userId) return res.status(401).json({ message: "please login first" });
    if (!foodId) return res.status(400).json({ message: "foodId is required" });

    const food = await foodModel.findById(foodId).select("_id saveCount");
    if (!food) return res.status(404).json({ message: "Food not found" });

    const existing = await saveModel.findOne({ user: userId, food: foodId });

    if (existing) {
      // UNSAVE
      await saveModel.deleteOne({ _id: existing._id });
      const updated = await foodModel.findByIdAndUpdate(
        foodId,
        { $inc: { saveCount: -1 } },
        { new: true, select: "saveCount" }
      );
      return res.status(200).json({
        message: "Food item unsaved successfully",
        saved: false,
        saveCount: Math.max(0, updated?.saveCount ?? 0),
      });
    }

    // SAVE (handle duplicate race)
    try {
      await saveModel.create({ user: userId, food: foodId });
    } catch (err) {
      if (err?.code !== 11000) throw err;
      // duplicate => treat as saved
    }

    const updated = await foodModel.findByIdAndUpdate(
      foodId,
      { $inc: { saveCount: 1 } },
      { new: true, select: "saveCount" }
    );

    return res.status(201).json({
      message: "Food item saved successfully",
      saved: true,
      saveCount: Math.max(0, updated?.saveCount ?? 0),
    });
  } catch (err) {
    console.error("saveFood error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getSavedFoods(req, res) {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "please login first" });

    const docs = await saveModel
      .find({ user: userId })
      .populate({
        path: "food",
        select: "_id name description video foodPartner likeCount saveCount",
      })
      .lean();

    const savedItems = docs
      .map((d) => d.food)
      .filter(Boolean)
      .map((f) => ({ ...f, isSaved: true }));

    return res.status(200).json({ savedItems });
  } catch (err) {
    console.error("getSavedFoods error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  createFood,
  getFoodItems,
  likeFood,
  saveFood,
  getSavedFoods,
};
