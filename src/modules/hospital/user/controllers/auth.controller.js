import {
  registerUserService,
  loginUserService
} from "../services/auth.service.js";

// export const registerUser = async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       phone,
//       email,
//       password,
//       confirmPassword,
//       termsAccepted
//     } = req.body;

//     // Basic validation (admin style)
//     if (!firstName || !lastName || !phone || !email || !password || !confirmPassword) {
//       return res.status(400).json({ message: "Required fields are missing" });
//     }

//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     if (!termsAccepted) {
//       return res.status(400).json({ message: "Please accept the terms & conditions" });
//     }

//     // Service call
//     const result = await registerUserService(req.body);

//     return res.status(201).json({
//       message: "Registration successful",
//       data: result
//     });

//   } catch (err) {
//     return res.status(500).json({ message: err.message });
//   }
// };


// export const loginUser = async (req, res) => {
//   try {
//     let { identifier, password } = req.body;

//     // identifier = email OR phone
//     if (!identifier || !password) {
//       return res.status(400).json({
//         message: "Email/phone and password are required"
//       });
//     }

//     identifier = String(identifier).trim();

//     const result = await loginUserService({ identifier, password });

//     return res.json({
//       message: "Login successful",
//       data: result
//     });

//   } catch (err) {
//     if (err.message === "INVALID_CREDENTIALS") {
//       return res.status(401).json({
//         message: "Invalid email/phone or password"
//       });
//     }

//     return res.status(500).json({ message: err.message });
//   }
// };

// export const registerUser = async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       phone,
//       email,
//       password,
//       confirmPassword,
//       termsAccepted
//     } = req.body;

//     // Required fields
//     if (
//       !firstName ||
//       !lastName ||
//       !phone ||
//       !email ||
//       !password ||
//       !confirmPassword
//     ) {
//       return res.status(400).json({ message: "Required fields are missing" });
//     }

//     // First name validation (min 4 letters)
//     if (firstName.trim().length < 4) {
//       return res.status(400).json({
//         message: "First name must be at least 4 characters long"
//       });
//     }

//     // Allow only alphabets in first name
//     const nameRegex = /^[A-Za-z]+$/;
//     if (!nameRegex.test(firstName)) {
//       return res.status(400).json({
//         message: "First name should contain only letters"
//       });
//     }

//     // Email validation (only @gmail.com)
//     const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
//     if (!gmailRegex.test(email)) {
//       return res.status(400).json({
//         message: "Only Gmail addresses are allowed"
//       });
//     }

//     // Phone validation (digits only, 10 digits)
//     const phoneRegex = /^[0-9]{10}$/;
//     if (!phoneRegex.test(phone)) {
//       return res.status(400).json({
//         message: "Phone number must be 10 digits"
//       });
//     }

//     // Password validation
//     if (password.length < 6) {
//       return res.status(400).json({
//         message: "Password must be at least 6 characters long"
//       });
//     }

//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     if (!termsAccepted) {
//       return res.status(400).json({
//         message: "Please accept the terms & conditions"
//       });
//     }

//     // Service call
//     const result = await registerUserService(req.body);

//     return res.status(201).json({
//       message: "Registration successful",
//       data: result
//     });

//   } catch (err) {
//     return res.status(500).json({ message: err.message });
//   }
//  };
export const registerUser = async (req, res) => {
   try {
    const result = await registerUserService(req.body);

    return res.status(201).json({
      message: "Registration successful",
      data: result
    });
   } catch (err) {
    return res.status(500).json({ message: err.message });
  }
 };

//  export const loginUser = async (req, res) => {
//   try {
//     let { identifier, password } = req.body;

//     // identifier = email OR phone
//     if (!identifier || !password) {
//       return res.status(400).json({
//         message: "Email/phone and password are required"
//       });
//     }

//     identifier = String(identifier).trim();

//     const result = await loginUserService({ identifier, password });

//     return res.json({
//       message: "Login successful",
//       data: result
//     });

//   } catch (err) {
//     if (err.message === "INVALID_CREDENTIALS") {
//       return res.status(401).json({
//         message: "Invalid email/phone or password"
//       });
//     }

//     return res.status(500).json({ message: err.message });
//   }
// };

export const loginUser = async (req, res) => {
  try {
    const result = await loginUserService(req.body);

    return res.json({
      message: "Login successful",
      data: result
    });
   } catch (err) {
    if (err.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        message: "Invalid email/phone or password"
      });
    }

    return res.status(500).json({ message: err.message });
  }
};
