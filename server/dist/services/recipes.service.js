"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRecipes = listRecipes;
exports.getRecipeBySlug = getRecipeBySlug;
exports.getRecipeById = getRecipeById;
exports.createRecipe = createRecipe;
exports.updateRecipe = updateRecipe;
exports.deleteRecipe = deleteRecipe;
const client_1 = require("../prisma/client");
async function listRecipes(query, page = 1, size = 12) {
    const where = query
        ? {
            OR: [
                {
                    title: {
                        contains: query,
                        mode: "insensitive", // literal type
                    },
                },
            ],
        }
        : undefined;
    const [items, total] = await Promise.all([
        client_1.prisma.recipe.findMany({
            where,
            skip: (page - 1) * size,
            take: size,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                slug: true,
                imageUrl: true,
                description: true,
                method: true,
                avgRating: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        reviews: true,
                        ingredients: true,
                    }
                }
            }
        }),
        client_1.prisma.recipe.count({ where })
    ]);
    return { items, total, page, size };
}
async function getRecipeBySlug(slug) {
    return client_1.prisma.recipe.findUnique({
        where: { slug },
        include: { ingredients: { include: { type: true } }, reviews: { orderBy: { createdAt: "desc" }, take: 25 } },
    });
}
async function getRecipeById(id) {
    return client_1.prisma.recipe.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
            description: true,
            method: true,
            avgRating: true,
            createdAt: true,
            updatedAt: true,
        }
    });
}
async function createRecipe(data) {
    const { ingredients, ...rest } = data;
    return client_1.prisma.recipe.create({
        data: {
            ...rest,
            ingredients: {
                create: ingredients.map((ing) => {
                    // If client sent typeId, use that; otherwise use name with connectOrCreate
                    if (ing.typeId) {
                        return {
                            amount: ing.amount,
                            type: { connect: { id: ing.typeId } },
                        };
                    }
                    // ing.name is guaranteed by the validator if no typeId
                    return {
                        amount: ing.amount,
                        type: {
                            connectOrCreate: {
                                where: { name: ing.name },
                                create: { name: ing.name },
                            },
                        },
                    };
                }),
            },
        },
        include: { ingredients: { include: { type: true } }, reviews: true },
    });
}
async function updateRecipe(id, data) {
    const { ingredients, ...rest } = data;
    return client_1.prisma.recipe.update({
        where: { id },
        data: {
            ...rest,
            ingredients: {
                deleteMany: {}, // Remove all existing ingredients
                create: ingredients.map((ing) => {
                    // If client sent typeId, use that; otherwise use name with connectOrCreate
                    if (ing.typeId) {
                        return {
                            amount: ing.amount,
                            type: { connect: { id: ing.typeId } },
                        };
                    }
                    // ing.name is guaranteed by the validator if no typeId
                    return {
                        amount: ing.amount,
                        type: {
                            connectOrCreate: {
                                where: { name: ing.name },
                                create: { name: ing.name },
                            },
                        },
                    };
                }),
            },
        },
        include: { ingredients: { include: { type: true } }, reviews: true },
    });
}
async function deleteRecipe(id) {
    return client_1.prisma.recipe.delete({
        where: { id },
    });
}
