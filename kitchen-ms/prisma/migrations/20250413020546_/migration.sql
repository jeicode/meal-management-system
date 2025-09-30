/*
  Warnings:

  - You are about to drop the column `published` on the `Recipe` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('WAITING_FOR_INGREDIENTS', 'DELIVERED');

-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "published";

-- CreateTable
CREATE TABLE "OrderHistory" (
    "id" SERIAL NOT NULL,
    "listRecipes" JSONB[],
    "status" "OrderStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "OrderHistory_pkey" PRIMARY KEY ("id")
);
