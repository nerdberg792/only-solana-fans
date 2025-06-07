/*
  Warnings:

  - You are about to drop the column `userId` on the `Purchase` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transactionSignature]` on the table `Purchase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[buyerWalletAddress,postId]` on the table `Purchase` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `buyerWalletAddress` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_userId_fkey";

-- DropIndex
DROP INDEX "Purchase_userId_postId_key";

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "userId",
ADD COLUMN     "buyerWalletAddress" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_transactionSignature_key" ON "Purchase"("transactionSignature");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_buyerWalletAddress_postId_key" ON "Purchase"("buyerWalletAddress", "postId");

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_buyerWalletAddress_fkey" FOREIGN KEY ("buyerWalletAddress") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;
