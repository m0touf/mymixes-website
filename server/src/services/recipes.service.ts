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
      include: { ingredients: true }
    }),
    prisma.recipe.count({ where })
  ]);
  return { items, total, page, size };
}

export async function getRecipeBySlug(slug: string) {
  return prisma.recipe.findUnique({
    where: { slug },
    include: { ingredients: true, reviews: { orderBy: { createdAt: "desc" }, take: 25 } },
  });
}

export async function createRecipe(data: CreateRecipeDTO, authorId?: number) {
  const { ingredients, ...rest } = data;

  return prisma.recipe.create({
    data: {
      ...rest,
      authorId,
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
    include: { ingredients: { include: { type: true } } },
  });
}
