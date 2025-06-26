/*
  Warnings:

  - You are about to drop the column `roomId` on the `Chats` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Chats` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chats" DROP CONSTRAINT "Chats_roomId_fkey";

-- AlterTable
ALTER TABLE "Chats" DROP COLUMN "roomId",
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Room_slug_key" ON "Room"("slug");

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_slug_fkey" FOREIGN KEY ("slug") REFERENCES "Room"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
