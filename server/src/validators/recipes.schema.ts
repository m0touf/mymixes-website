import { z } from "zod";

export const IngredientInput = z.object({
  typeId: z.number().int().positive().optional(),
  name: z
    .string()
    .min(1)
    .optional()
    .transform((val) => val?.trim().toLowerCase()), // 👈 normalize here
  amount: z.string().min(1),
}).refine(
  (v) => !!v.typeId || !!v.name,
  { message: "Provide either typeId or name" }
);

export const CreateRecipeInput = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  imageUrl: z.string().url().optional(),
  description: z.string().optional(),
  method: z.string().min(5),
  ingredients: z.array(IngredientInput).min(1),
});

export type CreateRecipeDTO = z.infer<typeof CreateRecipeInput>;

