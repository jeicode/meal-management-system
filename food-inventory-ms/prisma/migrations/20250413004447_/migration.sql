/*
  Warnings:

  - You are about to drop the `pendingPurchase` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "pendingPurchase";

-- CreateTable
CREATE TABLE "PendingPurchase" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "ingredientName" TEXT NOT NULL,
    "missingAmount" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "PendingPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseHistory" (
    "id" SERIAL NOT NULL,
    "recipeToPrepare" INTEGER NOT NULL,
    "ingredientToPurchase" INTEGER NOT NULL,
    "quantityPurchased" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "PurchaseHistory_pkey" PRIMARY KEY ("id")
);
