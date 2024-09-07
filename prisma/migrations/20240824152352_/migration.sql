-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('pending', 'success', 'failed');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "refundTo" JSONB;

-- CreateTable
CREATE TABLE "Refund" (
    "id" SERIAL NOT NULL,
    "trxId" TEXT NOT NULL,
    "productCode" INTEGER NOT NULL,
    "merchant" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "status" "RefundStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Refund_trxId_key" ON "Refund"("trxId");

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_trxId_fkey" FOREIGN KEY ("trxId") REFERENCES "Transaction"("trxId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_productCode_fkey" FOREIGN KEY ("productCode") REFERENCES "Variation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
