import { z } from "zod";
////auth
export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const SigninSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
////room
export const CreateRoomSchema = z.object({
  name: z.string().min(1)
});

