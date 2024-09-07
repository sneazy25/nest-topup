/*
  Warnings:

  - Made the column `limit` on table `Discount` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Discount" ALTER COLUMN "limit" SET NOT NULL,
ALTER COLUMN "limit" SET DATA TYPE INTEGER;
