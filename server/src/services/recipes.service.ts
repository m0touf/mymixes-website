import { prisma } from "../prisma/client";
import { Prisma } from "@prisma/client";
import type { CreateRecipeDTO } from "../validators/recipes.schema";

export async function listRecipes(query?: string, page = 1, size = 12) {
  const where: Prisma.RecipeWhereInput | undefined = query
    ? {
      OR: [
        {
          title: {
            contains: query,
            mode: "insensitive" as const, // literal type
          },
        },
      ],
    }
    : undefined;
  const [items, total] = await Promise.all([
    prisma.recipe.findMany({
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
    prisma.recipe.count({ where })
  ]);
  return { items, total, page, size };
}

export async function getRecipeBySlug(slug: string) {
  return prisma.recipe.findUnique({
    where: { slug },
    include: { ingredients: { include: { type: true } }, reviews: { orderBy: { createdAt: "desc" }, take: 25 } },
  });
}

export async function getRecipeById(id: number) {
  return prisma.recipe.findUnique({
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

export async function createRecipe(data: CreateRecipeDTO) {
  const { ingredients, ...rest } = data;

  return prisma.recipe.create({
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
                where: { name: ing.name! },
                create: { name: ing.name! },
              },
            },
          };
        }),
      },
    },
    include: { ingredients: { include: { type: true } }, reviews: true },
  });
}

export async function updateRecipe(id: number, data: CreateRecipeDTO) {
  const { ingredients, ...rest } = data;

  return prisma.recipe.update({
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
                where: { name: ing.name! },
                create: { name: ing.name! },
              },
            },
          };
        }),
      },
    },
    include: { ingredients: { include: { type: true } }, reviews: true },
  });
}

export async function deleteRecipe(id: number) {
  return prisma.recipe.delete({
    where: { id },
  });
}
