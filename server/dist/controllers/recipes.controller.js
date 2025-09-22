"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecipes = getRecipes;
exports.getRecipe = getRecipe;
exports.postRecipe = postRecipe;
exports.putRecipe = putRecipe;
exports.deleteRecipeController = deleteRecipeController;
const recipes_schema_1 = require("../validators/recipes.schema");
const recipes_service_1 = require("../services/recipes.service");
async function getRecipes(req, res) {
    const q = String(req.query.query ?? "");
    const page = Number(req.query.page ?? 1);
    const size = Number(req.query.size ?? 12);
    const data = await (0, recipes_service_1.listRecipes)(q, page, size);
    res.json(data);
}
async function getRecipe(req, res) {
    const recipe = await (0, recipes_service_1.getRecipeBySlug)(req.params.slug);
    if (!recipe)
        return res.status(404).json({ error: "Recipe not found" });
    res.json(recipe);
}
async function postRecipe(req, res) {
    const parsed = recipes_schema_1.CreateRecipeInput.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues });
    const recipe = await (0, recipes_service_1.createRecipe)(parsed.data);
    res.status(201).json(recipe);
}
async function putRecipe(req, res) {
    const id = Number(req.params.id);
    const parsed = recipes_schema_1.CreateRecipeInput.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues });
    const recipe = await (0, recipes_service_1.updateRecipe)(id, parsed.data);
    res.json(recipe);
}
async function deleteRecipeController(req, res) {
    const id = Number(req.params.id);
    await (0, recipes_service_1.deleteRecipe)(id);
    res.status(204).send();
}
