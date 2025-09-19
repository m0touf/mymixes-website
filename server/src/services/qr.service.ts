import { prisma } from "../prisma/client";
import crypto from "crypto";

export interface QrTokenData {
  token: string;
  expiresAt: Date;
  recipeId: number;
}

export async function generateSecureQrToken(recipeId: number): Promise<QrTokenData & { id: string; recipe: { id: number; title: string; slug: string } }> {
  // Check if recipe exists and get recipe info in one query
  const recipe = await prisma.recipe.findUnique({ 
    where: { id: recipeId },
    select: { id: true, title: true, slug: true }
  });
  if (!recipe) {
    throw new Error("Recipe not found");
  }

  // Generate secure random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Set expiration to 1 year from now (QR codes should be long-lived for physical menus)
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  // Store token in database
  const qrToken = await prisma.qrToken.create({
    data: {
      token,
      recipeId,
      expiresAt,
    },
  });

  return { id: qrToken.id, token, expiresAt, recipeId, recipe };
}

export async function validateQrToken(token: string): Promise<{ valid: boolean; recipeId?: number }> {
  try {
    const qrToken = await prisma.qrToken.findUnique({
      where: { token },
      include: { recipe: true },
    });

    if (!qrToken) {
      return { valid: false };
    }

    // Check if token is expired
    if (new Date() > qrToken.expiresAt) {
      return { valid: false };
    }

    // Check if recipe still exists
    if (!qrToken.recipe) {
      return { valid: false };
    }

    return { valid: true, recipeId: qrToken.recipeId };
  } catch (error) {
    console.error("Error validating QR token:", error);
    return { valid: false };
  }
}

export async function markTokenAsUsed(token: string): Promise<void> {
  try {
    await prisma.qrToken.update({
      where: { token },
      data: { used: true, usedAt: new Date() },
    });
  } catch (error) {
    console.error("Error marking token as used:", error);
  }
}

export async function getActiveQrTokens(recipeId?: number) {
  const where = recipeId ? { recipeId } : {};
  
  return prisma.qrToken.findMany({
    where: {
      ...where,
      expiresAt: { gt: new Date() }, // Only active tokens
    },
    include: {
      recipe: {
        select: { id: true, title: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteQrToken(tokenId: string): Promise<void> {
  const qrToken = await prisma.qrToken.findUnique({
    where: { id: tokenId },
  });

  if (!qrToken) {
    throw new Error("QR token not found");
  }

  await prisma.qrToken.delete({
    where: { id: tokenId },
  });
}

export async function getQrTokenCounts(): Promise<Record<number, number>> {
  const counts = await prisma.qrToken.groupBy({
    by: ['recipeId'],
    where: {
      expiresAt: { gt: new Date() }, // Only count active tokens
    },
    _count: {
      id: true,
    },
  });

  const result: Record<number, number> = {};
  counts.forEach(count => {
    result[count.recipeId] = count._count.id;
  });

  return result;
}
