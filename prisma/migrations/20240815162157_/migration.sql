/*
  Warnings:

  - You are about to drop the column `used` on the `Discount` table. All the data in the column will be lost.
  - Added the required column `usage` to the `Discount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Discount" DROP COLUMN "used",
ADD COLUMN     "usage" INTEGER NOT NULL;
