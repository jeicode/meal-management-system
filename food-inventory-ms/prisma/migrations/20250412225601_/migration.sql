/*
  Warnings:

  - Added the required column `ingredientName` to the `pendingPurchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pendingPurchase" ADD COLUMN     "ingredientName" TEXT NOT NULL;
