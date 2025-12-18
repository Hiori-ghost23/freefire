import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/\d/, 'Le mot de passe doit contenir au moins un chiffre'),
  password_confirmation: z
    .string()
    .min(1, 'La confirmation est requise'),
  display_name: z
    .string()
    .optional(),
  country: z
    .string()
    .min(1, 'Le pays est requis'),
  phone: z
    .string()
    .regex(/^\d{8,15}$/, 'Numéro de téléphone invalide'),
  phone_code: z
    .string()
    .min(1, 'L\'indicatif est requis'),
  uid_freefire: z
    .string()
    .regex(/^\d{8,12}$/, 'L\'UID FreeFire doit contenir 8 à 12 chiffres'),
  terms: z
    .boolean()
    .refine(value => value === true, 'Vous devez accepter les conditions'),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Les mots de passe ne correspondent pas",
  path: ["password_confirmation"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
