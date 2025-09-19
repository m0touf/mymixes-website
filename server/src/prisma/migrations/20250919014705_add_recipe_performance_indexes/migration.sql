-- CreateIndex
CREATE INDEX "Ingredient_recipeId_idx" ON "public"."Ingredient"("recipeId");

-- CreateIndex
CREATE INDEX "Ingredient_typeId_idx" ON "public"."Ingredient"("typeId");

-- CreateIndex
CREATE INDEX "Recipe_createdAt_idx" ON "public"."Recipe"("createdAt");

-- CreateIndex
CREATE INDEX "Recipe_title_idx" ON "public"."Recipe"("title");

-- CreateIndex
CREATE INDEX "Recipe_avgRating_idx" ON "public"."Recipe"("avgRating");
