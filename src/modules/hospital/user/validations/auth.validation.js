import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(4, "First name must be at least 4 characters")
    .regex(/^[A-Za-z]+$/, "First name must contain only letters"),

  lastName: z.string().min(1, "Last name is required"),

  email: z
    .string()
    .email("Invalid email format")
    .refine(
      (val) => val.endsWith("@gmail.com") || val.endsWith("@email.com"),
      {
        message: "Email must be either @gmail.com or @email.com"
      }
    ),

  phone: z
    .string()
    .regex(/^[6-9][0-9]{9}$/, "Phone must start with 6,7,8,9 and be 10 digits"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  confirmPassword: z.string(),

  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Terms must be accepted" })
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or phone is required")
    .refine((val) => {
      const isPhone = /^[6-9][0-9]{9}$/.test(val);
      const isAllowedEmail =
        /^[^\s@]+@(gmail\.com|email\.com)$/.test(val);

      return isPhone || isAllowedEmail;
    }, {
      message: "Identifier must be a valid phone or @gmail.com / @email.com email"
    }),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
});