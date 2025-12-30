import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  category: z.string().min(1, "La catégorie est requise"),
  price: z.number({ invalid_type_error: "Le prix doit être un nombre" })
          .min(0, "Le prix ne peut pas être négatif"),
  description: z.string().optional(),
  // Image is handled separately via state/upload, but validation can be added if needed
});
