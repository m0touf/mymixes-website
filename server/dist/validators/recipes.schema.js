"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRecipeInput = exports.IngredientInput = void 0;
const zod_1 = require("zod");
exports.IngredientInput = zod_1.z.object({
    typeId: zod_1.z.number().int().positive().optional(),
    name: zod_1.z
        .string()
        .min(1)
        .optional()
        .transform((val) => val?.trim().toLowerCase()), // 👈 normalize here
    amount: zod_1.z.string().min(1),
}).refine((v) => !!v.typeId || !!v.name, { message: "Provide either typeId or name" });
exports.CreateRecipeInput = zod_1.z.object({
    title: zod_1.z.string().min(2),
    slug: zod_1.z.string().min(2),
    imageUrl: zod_1.z.string().url().optional().or(zod_1.z.literal("")).transform(val => val === "" ? undefined : val),
    description: zod_1.z.string().optional(),
    method: zod_1.z.string().min(5),
    ingredients: zod_1.z.array(exports.IngredientInput).min(1),
});
