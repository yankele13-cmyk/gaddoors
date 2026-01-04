import { z } from 'zod';

export const PRODUCT_STATUS = ['draft', 'active', 'archived', 'deleted'];

export const productSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  sku: z.string().optional().nullable(),
  category: z.string().min(1, "La catégorie est requise"),
  price: z.number({ invalid_type_error: "Le prix doit être un nombre" })
          .min(0, "Le prix ne peut pas être négatif"),
  stock: z.number().min(0).optional().default(0),
  description: z.string().optional(),
  
  // New Architecture Fields
  status: z.enum(PRODUCT_STATUS).default('draft'),
  visibility: z.boolean().default(false), // Controls if visible on store
  
  // Image handling (URLs)
  imageUrl: z.string().url().optional().nullable(),
  images: z.array(z.object({
      url: z.string().url(),
      path: z.string().optional(), // Storage path for deletion
      isPrimary: z.boolean().optional()
  })).optional().default([]),

  // Metadata (ReadOnly usually, but validated here for shape)
  metadata: z.object({
      createdAt: z.any().optional(),
      updatedAt: z.any().optional(),
      createdBy: z.string().optional(),
      updatedBy: z.string().optional()
  }).optional()
});

export const productFormSchema = productSchema.omit({ 
    metadata: true,
    // Images might be handled as FileList in form, so we refine that in the Form Component
});
