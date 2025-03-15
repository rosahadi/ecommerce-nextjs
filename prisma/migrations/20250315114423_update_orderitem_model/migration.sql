/*
  Warnings:

  - The values [PAYPAL] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `OrderItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `qty` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `salePrice` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderId,productId,color,size]` on the table `OrderItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('STRIPE', 'CASH_ON_DELIVERY');
ALTER TABLE "Order" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "PaymentMethod_old";
COMMIT;

-- AlterTable
ALTER TABLE "OrderItem" DROP CONSTRAINT "orderitems_orderId_productId_pk",
DROP COLUMN "qty",
ADD COLUMN     "color" TEXT,
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "size" "Size",
ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "salePrice";

-- CreateIndex
DROP INDEX IF EXISTS "orderitems_orderId_productId_color_size_unique";
CREATE UNIQUE INDEX "orderitems_orderId_productId_color_size_unique" ON "OrderItem"("orderId", "productId", "color", "size");
