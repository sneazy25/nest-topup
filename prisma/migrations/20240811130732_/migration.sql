/*
  Warnings:

  - The values [FIXED_AMOUNT] on the enum `DiscountType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `fixedAmount` on the `Discount` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DiscountType_new" AS ENUM ('PERCENTAGE', 'REDUCE_PRICE');
ALTER TABLE "Discount" ALTER COLUMN "type" TYPE "DiscountType_new" USING ("type"::text::"DiscountType_new");
ALTER TYPE "DiscountType" RENAME TO "DiscountType_old";
ALTER TYPE "DiscountType_new" RENAME TO "DiscountType";
DROP TYPE "DiscountType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Discount" DROP COLUMN "fixedAmount",
ADD COLUMN     "priceReduce" DOUBLE PRECISION;
