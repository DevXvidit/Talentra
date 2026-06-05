import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['candidate', 'recruiter']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const completeProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().length(10, 'Phone number must be exactly 10 digits'),
  location: z.string().min(2, 'Location is required'),
  title: z.string().min(2, 'Professional title must be at least 2 characters').max(50, 'Title cannot exceed 50 characters'),
  experience: z.string()
    .min(1, 'Years of experience is required')
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0;
    }, 'Please enter a valid number of years'),
  resume: z.any()
    .refine((val) => val !== null && val !== undefined, 'Please upload your resume document'),
});

export type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;
