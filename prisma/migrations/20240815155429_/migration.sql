/*
  Warnings:

  - A unique constraint covering the columns `[discountCode]` on the table `Discount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `discountCode` to the `Discount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Discount" ADD COLUMN     "discountCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "duitku" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "Discount_discountCode_key" ON "Discount"("discountCode");
