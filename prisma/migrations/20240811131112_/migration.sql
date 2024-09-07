/*
  Warnings:

  - The values [PERCENTAGE,REDUCE_PRICE] on the enum `DiscountType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DiscountType_new" AS ENUM ('percentage', 'price_reduce');
ALTER TABLE "Discount" ALTER COLUMN "type" TYPE "DiscountType_new" USING ("type"::text::"DiscountType_new");
ALTER TYPE "DiscountType" RENAME TO "DiscountType_old";
ALTER TYPE "DiscountType_new" RENAME TO "DiscountType";
DROP TYPE "DiscountType_old";
COMMIT;
