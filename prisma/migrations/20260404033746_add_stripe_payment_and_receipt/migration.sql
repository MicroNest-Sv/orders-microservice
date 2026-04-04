/*
  Warnings:

  - A unique constraint covering the columns `[stripe_payment_id]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "stripe_payment_id" TEXT;

-- CreateTable
CREATE TABLE "order_receipts" (
    "id" TEXT NOT NULL,
    "receipt_url" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_receipts_order_id_key" ON "order_receipts"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_stripe_payment_id_key" ON "orders"("stripe_payment_id");

-- AddForeignKey
ALTER TABLE "order_receipts" ADD CONSTRAINT "order_receipts_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
