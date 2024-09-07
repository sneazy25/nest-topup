/*
  Warnings:

  - Made the column `form` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "form" SET NOT NULL;
