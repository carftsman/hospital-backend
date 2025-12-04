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


export const loginUserService = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) throw new Error("Invalid email or password");

  // PERFORMANCE: check password last
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

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
