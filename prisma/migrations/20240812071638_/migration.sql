/*
  Warnings:

  - You are about to alter the column `percentage` on the `Discount` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(3,0)`.
  - You are about to alter the column `priceReduce` on the `Discount` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- CreateEnum
CREATE TYPE "TrxStatus" AS ENUM ('pending', 'process', 'success', 'partial', 'failed', 'validation');

-- AlterTable
ALTER TABLE "Discount" ALTER COLUMN "percentage" SET DATA TYPE DECIMAL(3,0),
ALTER COLUMN "priceReduce" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "published" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Variation" ALTER COLUMN "published" SET DEFAULT true;

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "trxId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "variationId" INTEGER NOT NULL,
    "customer" JSONB NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "TrxStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_trxId_key" ON "Transaction"("trxId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_variationId_fkey" FOREIGN KEY ("variationId") REFERENCES "Variation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
