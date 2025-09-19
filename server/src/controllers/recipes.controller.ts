import type { Request, Response } from "express";
import { CreateRecipeInput } from "../validators/recipes.schema";
import { createRecipe, getRecipeBySlug, listRecipes, updateRecipe, deleteRecipe } from "../services/recipes.service";

export async function getRecipes(req: Request, res: Response) {
    const q = String(req.query.query ?? "");
    const page = Number(req.query.page ?? 1);
    const size = Number(req.query.size ?? 12);
    const data = await listRecipes(q, page, size);
    res.json(data);
}

export async function getRecipe(req: Request, res: Response) {
    const recipe = await getRecipeBySlug(req.params.slug);
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });
    res.json(recipe);
}

export async function postRecipe(req: Request, res: Response) {
    const parsed = CreateRecipeInput.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
    const recipe = await createRecipe(parsed.data, req.user?.id);
    res.status(201).json(recipe);
}

export async function putRecipe(req: Request, res: Response) {
    const id = Number(req.params.id);
    const parsed = CreateRecipeInput.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
    const recipe = await updateRecipe(id, parsed.data, req.user?.id);
    res.json(recipe);
}

export async function deleteRecipeController(req: Request, res: Response) {
    const id = Number(req.params.id);
    await deleteRecipe(id);
    res.status(204).send();
}