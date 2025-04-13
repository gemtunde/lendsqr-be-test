import { z } from "zod";

export const emailSchema = z.string().trim().email().min(1).max(100);
export const passwordSchema = z.string().trim().min(1).max(100);

export const registerSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
