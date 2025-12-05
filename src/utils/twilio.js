import twilio from "twilio";


const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ---- SEND OTP ----
export const sendOtpTwilio = async (phone) => {
  return await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SID)
    .verifications.create({
      to: phone,
      channel: "sms"
    });
};

// ---- VERIFY OTP ----
export const verifyOtpTwilio = async (phone, otp) => {
  return await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SID)
    .verificationChecks.create({
      to: phone,
      code: otp
    });
};
