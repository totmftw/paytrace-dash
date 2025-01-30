import { z } from "zod";
import { ROLES } from "./constants";

export const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2),
  role: z.enum(ROLES),
  phone_number: z.string().min(10),
  designation: z.string().min(2),
  department: z.string().min(2),
  emergency_contact: z.string().min(10),
  address: z.string().min(5),
});

export type FormValues = z.infer<typeof formSchema>;