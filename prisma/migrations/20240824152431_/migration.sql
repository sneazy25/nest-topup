/*
  Warnings:

  - You are about to drop the column `productCode` on the `Refund` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Refund" DROP CONSTRAINT "Refund_productCode_fkey";

-- AlterTable
ALTER TABLE "Refund" DROP COLUMN "productCode";
