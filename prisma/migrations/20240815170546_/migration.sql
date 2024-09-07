/*
  Warnings:

  - You are about to drop the column `status` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `paymentStatus` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topupStatus` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'success', 'failed');

-- CreateEnum
CREATE TYPE "TopupStatus" AS ENUM ('pending', 'process', 'success', 'partial', 'failed', 'validation');

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "status",
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL,
ADD COLUMN     "topupStatus" "TopupStatus" NOT NULL;

-- DropEnum
DROP TYPE "TrxStatus";
