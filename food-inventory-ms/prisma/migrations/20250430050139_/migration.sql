/*
  Warnings:

  - You are about to drop the column `recipeToPrepare` on the `PurchaseHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PurchaseHistory" DROP COLUMN "recipeToPrepare",
ALTER COLUMN "ingredientToPurchase" SET DEFAULT '',
ALTER COLUMN "ingredientToPurchase" SET DATA TYPE VARCHAR(255);
