import jwt from "jsonwebtoken";
import User from "../models/User.js";
import CoachProfile from "../models/CoachProfile.js";
import AthleteProfile from "../models/AthleteProfile.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already in use" });

    const user = await User.create({ name, email, passwordHash: password, role });

    if (role === "coach")   await CoachProfile.create({ userId: user._id });
    if (role === "athlete") await AthleteProfile.create({ userId: user._id });

    res.status(201).json({
      token: signToken(user._id),
      user: { id: user._id, name, email, role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      token: signToken(user._id),
      user: { id: user._id, name: user.name, email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req, res) => res.json(req.user);