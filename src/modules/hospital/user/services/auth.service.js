import {
  createUser,
  findUserByEmail,
  findUserByPhone
} from "../repositories/user.repository.js";

import { hashPassword, comparePassword, signToken } from "../../../../utils/auth.js";

export const registerUserService = async (body) => {
  const { firstName, lastName, email, phone, password } = body;

  // PERFORMANCE: check duplicates before bcrypt
  const emailExists = await findUserByEmail(email);
  if (emailExists) throw new Error("Email already exists");

  const phoneExists = await findUserByPhone(phone);
  if (phoneExists) throw new Error("Phone already exists");

  // hash password
  const hashed = await hashPassword(password);

  const payload = {
    firstName,
    lastName,
    phone,
    email: email.toLowerCase(),
    password: hashed,
    termsAccepted: true,
    acceptedAt: new Date()
  };

  const user = await createUser(payload);

  // Create token same style as admin
  const token = signToken({
    id: user.id,
    role: "USER"
  });

  return {
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone
    }
  };
};


export const loginUserService = async ({ identifier, password }) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let user;

  // If identifier looks like an email → search by email
  if (emailRegex.test(identifier)) {
    user = await findUserByEmail(identifier.toLowerCase());
  } else {
    // Otherwise treat as phone
    user = await findUserByPhone(identifier);
  }

  if (!user) {
    const err = new Error("INVALID_CREDENTIALS");
    throw err;
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    const err = new Error("INVALID_CREDENTIALS");
    throw err;
  }

  const token = signToken({
    id: user.id,
    role: "USER"
  });

  return {
    token,
    user: {
      id: user.id,
      phone: user.phone
    }
  };
};