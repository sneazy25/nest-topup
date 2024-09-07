/*
  Warnings:

  - A unique constraint covering the columns `[productCode]` on the table `Variation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `form` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productCode` to the `Variation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "form" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Variation" ADD COLUMN     "productCode" VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Variation_productCode_key" ON "Variation"("productCode");
