/*
  Warnings:

  - You are about to drop the column `maxUsed` on the `Discount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Discount" DROP COLUMN "maxUsed",
ADD COLUMN     "limit" DECIMAL(8,0);
