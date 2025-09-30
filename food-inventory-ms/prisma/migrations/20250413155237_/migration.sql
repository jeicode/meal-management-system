/*
  Warnings:

  - Added the required column `orderId` to the `PurchaseHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseHistory" ADD COLUMN     "orderId" INTEGER NOT NULL;
