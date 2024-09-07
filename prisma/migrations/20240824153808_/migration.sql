/*
  Warnings:

  - You are about to drop the column `trxId` on the `Refund` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[trx_id]` on the table `Refund` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `trx_id` to the `Refund` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Refund" DROP CONSTRAINT "Refund_trxId_fkey";

-- DropIndex
DROP INDEX "Refund_trxId_key";

-- AlterTable
ALTER TABLE "Refund" DROP COLUMN "trxId",
ADD COLUMN     "trx_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Refund_trx_id_key" ON "Refund"("trx_id");

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_trx_id_fkey" FOREIGN KEY ("trx_id") REFERENCES "Transaction"("trxId") ON DELETE RESTRICT ON UPDATE CASCADE;
