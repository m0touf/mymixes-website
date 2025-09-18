-- CreateTable
CREATE TABLE "public"."QrToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QrToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QrToken_token_key" ON "public"."QrToken"("token");

-- AddForeignKey
ALTER TABLE "public"."QrToken" ADD CONSTRAINT "QrToken_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
