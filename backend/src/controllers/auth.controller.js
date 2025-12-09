const userModel = require("../models/user.model.js");
const foodPartnerModel = require("../models/foodpartner.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// cookie options – Render/Vercel (HTTPS, cross-site) ke liye
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,          // production: https required
  sameSite: "none",      // cross-site cookie allow
  path: "/",             // whole site
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function createToken(id) {
  // token me expiry dena achha rehta hai
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
}

async function registerUser(req, res) {
  try {
    const { fullname, email, password } = req.body;

    const isUserAlreadyExist = await userModel.findOne({ email });
    if (isUserAlreadyExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      fullname,
      email,
      password: hashedPassword,
    });

    const token = createToken(user._id);
    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid email or password" });

    const token = createToken(user._id);
    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
}

function logoutUser(req, res) {
  // clearCookie ke liye SAME options (path/sameSite/secure) dena zaroori
  res.clearCookie("token", { path: "/", sameSite: "none", secure: true });
  return res.status(200).json({ message: "User logged out successfully" });
}

async function registerFoodPartner(req, res) {
  try {
    const { fullname, email, password, phone, city } = req.body;

    const exists = await foodPartnerModel.findOne({ email });
    if (exists) return res.status(400).json({ message: "Food Partner already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const fp = await foodPartnerModel.create({
      fullname,
      email,
      password: hashedPassword,
      phone,
      city,
    });

    const token = createToken(fp._id);
    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(201).json({
      message: "Food Partner registered successfully",
      foodPartner: {
        _id: fp._id,
        fullname: fp.fullname,
        email: fp.email,
        phone: fp.phone,
        city: fp.city,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function loginFoodPartner(req, res) {
  try {
    const { email, password } = req.body;

    const fp = await foodPartnerModel.findOne({ email });
    if (!fp) return res.status(400).json({ message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, fp.password);
    if (!ok) return res.status(400).json({ message: "Invalid email or password" });

    const token = createToken(fp._id);
    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(200).json({
      message: "Food Partner logged in successfully",
      foodPartner: {
        _id: fp._id,
        fullname: fp.fullname,
        email: fp.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
}

function logoutFoodPartner(req, res) {
  res.clearCookie("token", { path: "/", sameSite: "none", secure: true });
  return res.status(200).json({ message: "Food Partner logged out successfully" });
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  registerFoodPartner,
  loginFoodPartner,
  logoutFoodPartner,
};
