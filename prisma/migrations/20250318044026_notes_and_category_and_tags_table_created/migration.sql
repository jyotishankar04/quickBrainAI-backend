/*
  Warnings:

  - You are about to drop the `noteTagOnNotes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `noteTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "noteTagOnNotes" DROP CONSTRAINT "noteTagOnNotes_noteId_fkey";

-- DropForeignKey
ALTER TABLE "noteTagOnNotes" DROP CONSTRAINT "noteTagOnNotes_tagId_fkey";

-- DropForeignKey
ALTER TABLE "noteTags" DROP CONSTRAINT "noteTags_userId_fkey";

-- AlterTable
ALTER TABLE "notes" ADD COLUMN     "tags" TEXT[];

-- DropTable
DROP TABLE "noteTagOnNotes";

-- DropTable
DROP TABLE "noteTags";
