import jwt from "jsonwebtoken";
import prisma from "../../../../prisma/client.js";

/**
 * SEND OTP
 * - MUST create user if not exists
 * - MUST NOT check "phone registered"
 */
// export const sendOtpService = async (phone) => {
//   let user = await prisma.user.findUnique({ where: { phone } });

//   if (!user) {
//     user = await prisma.user.create({
//       data: {
//         phone,
//         isPhoneVerified: false,
//         isOnboardingCompleted: false
//       }
//     });
//   }

//   const otpCode = "007007";
//   const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

//   await prisma.user.update({
//     where: { phone },
//     data: {
//       otpCode,
//       otpExpiresAt
//     }
//   });

//   // ✅ RETURN OTP ONLY IN DEV
//   if (process.env.NODE_ENV !== "production") {
//     return { otp: otpCode };
//   }

//   return {};
// };

export const sendOtpService = async (phone) => {
  let user = await prisma.user.findUnique({
    where: { phone }
  });

  // Create user if not exists
  if (!user) {
    user = await prisma.user.create({
      data: {
        phone,
        isPhoneVerified: false,
        isOnboardingCompleted: false
      }
    });
  }

  const otpCode = "007007";
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.user.update({
    where: { phone },
    data: {
      otpCode,
      otpExpiresAt
    }
  });

  // ✅ ALWAYS RETURN OTP (DEV + PROD)
  return { otp: otpCode };
};


/**
 * VERIFY OTP
 */
export const verifyStaticOtpService = async (phone, otp) => {
  const user = await prisma.user.findUnique({
    where: { phone }
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND"); // should NEVER happen now
  }

  if (user.otpCode !== otp || user.otpExpiresAt < new Date()) {
    throw new Error("INVALID_OTP");
  }

  const updatedUser = await prisma.user.update({
    where: { phone },
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
