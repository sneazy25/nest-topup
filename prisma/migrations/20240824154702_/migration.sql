/*
  Warnings:

  - You are about to drop the column `trxId` on the `Refund` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[refId]` on the table `Refund` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `refId` to the `Refund` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Refund" DROP CONSTRAINT "Refund_trxId_fkey";

-- DropIndex
DROP INDEX "Refund_trxId_key";

-- AlterTable
ALTER TABLE "Refund" DROP COLUMN "trxId",
ADD COLUMN     "refId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Refund_refId_key" ON "Refund"("refId");

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_refId_fkey" FOREIGN KEY ("refId") REFERENCES "Transaction"("trxId") ON DELETE RESTRICT ON UPDATE CASCADE;
