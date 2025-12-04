import {
  registerUserService,
  loginUserService
} from "../services/auth.service.js";

export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      password,
      confirmPassword,
      termsAccepted
    } = req.body;

    // Basic validation (admin style)
    if (!firstName || !lastName || !phone || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (!termsAccepted) {
      return res.status(400).json({ message: "Please accept the terms & conditions" });
    }

    // Service call
    const result = await registerUserService(req.body);

    return res.status(201).json({
      message: "Registration successful",
      data: result
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // trim + normalize (same as admin)
    email = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const result = await loginUserService({ email, password });

    return res.json({
      message: "Login successful",
      data: result
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
