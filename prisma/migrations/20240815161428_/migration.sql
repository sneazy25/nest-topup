/*
  Warnings:

  - Added the required column `used` to the `Discount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Discount" ADD COLUMN     "used" INTEGER NOT NULL;
