-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateTable
CREATE TABLE "Discount" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "minPrice" DECIMAL(10,2),
    "maxPrice" DECIMAL(10,2),
    "maxDate" TIMESTAMP(3),
    "type" "DiscountType" NOT NULL,
    "percentage" DOUBLE PRECISION,
    "fixedAmount" DOUBLE PRECISION,
    "published" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Discount" ADD CONSTRAINT "Discount_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
