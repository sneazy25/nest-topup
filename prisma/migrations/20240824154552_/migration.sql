/*
  Warnings:

  - You are about to drop the column `trx_id` on the `Refund` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[trxId]` on the table `Refund` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `trxId` to the `Refund` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Refund" DROP CONSTRAINT "Refund_trx_id_fkey";

-- DropIndex
DROP INDEX "Refund_trx_id_key";

-- AlterTable
ALTER TABLE "Refund" DROP COLUMN "trx_id",
ADD COLUMN     "trxId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Refund_trxId_key" ON "Refund"("trxId");

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_trxId_fkey" FOREIGN KEY ("trxId") REFERENCES "Transaction"("trxId") ON DELETE RESTRICT ON UPDATE CASCADE;
