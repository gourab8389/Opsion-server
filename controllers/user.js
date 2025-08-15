import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/user.js";
import { inngest } from "../inngest/client";

export const signup = async (req, res) => {
  const { email, password, skills = [] } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, skills });

    // Fire the inngest event
    await inngest.send({
      name: "user/signup",
      data: { email },
    });

    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "5d" }
    );

    res.status(201).json({
      message: "User created successfully",
      user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "User creation failed",
      error: error.message,
    });
  }
};
