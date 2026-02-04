import jwt from "jsonwebtoken";
import prisma from "../../../../prisma/client.js";

/**
 * SEND OTP
 * - MUST create user if not exists
 * - MUST NOT check "phone registered"
 */
export const sendOtpService = async ({ phone, email }) => {
  if (!phone && !email) {
    throw new Error("PHONE_OR_EMAIL_REQUIRED");
  }

  //  Find user by phone OR email
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        phone ? { phone } : undefined,
        email ? { email } : undefined
      ].filter(Boolean)
    }
  });

  //  Create user if not exists
  if (!user) {
    user = await prisma.user.create({
      data: {
        phone: phone || null,
        email: email || null,
        isPhoneVerified: false,
        isOnboardingCompleted: false
      }
    });
  }

  const otpCode = "007007";
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Save OTP
  await prisma.user.update({
    where: { id: user.id },
    data: {
      otpCode,
      otpExpiresAt
    }
  });

  //  Email OTP (optional)
  if (email) {
    console.log(`OTP ${otpCode} sent to email ${email}`);
  }

  //  SMS OTP (optional)
  if (phone) {
    console.log(`OTP ${otpCode} sent to phone ${phone}`);
  }

  //  Always return OTP (as per your requirement)
  return { otp: otpCode };
};

export const verifyStaticOtpService = async ({ phone, email, otp }) => {
  if ((!phone && !email) || !otp) {
    throw new Error("INVALID_INPUT");
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        phone ? { phone } : undefined,
        email ? { email } : undefined
      ].filter(Boolean)
    }
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (user.otpCode !== otp || user.otpExpiresAt < new Date()) {
    throw new Error("INVALID_OTP");
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isPhoneVerified: true,
      otpCode: null,
      otpExpiresAt: null
    }
  });

  const token = jwt.sign(
    { id: updatedUser.id, role: "USER" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: updatedUser
  };
};
