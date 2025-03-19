/*
  Warnings:

  - A unique constraint covering the columns `[noteId]` on the table `chats` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chatId]` on the table `notes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_noteId_fkey";

-- AlterTable
ALTER TABLE "notes" ADD COLUMN     "chatId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "chats_noteId_key" ON "chats"("noteId");

-- CreateIndex
CREATE UNIQUE INDEX "notes_chatId_key" ON "notes"("chatId");

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
