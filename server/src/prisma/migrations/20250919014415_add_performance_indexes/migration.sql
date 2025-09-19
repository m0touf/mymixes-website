-- CreateIndex
CREATE INDEX "QrToken_recipeId_idx" ON "public"."QrToken"("recipeId");

-- CreateIndex
CREATE INDEX "QrToken_expiresAt_idx" ON "public"."QrToken"("expiresAt");

-- CreateIndex
CREATE INDEX "QrToken_used_idx" ON "public"."QrToken"("used");

-- CreateIndex
CREATE INDEX "Review_recipeId_idx" ON "public"."Review"("recipeId");

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "public"."Review"("createdAt");
