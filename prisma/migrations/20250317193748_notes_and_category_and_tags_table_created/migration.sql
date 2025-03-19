/*
  Warnings:

  - You are about to drop the column `notesId` on the `noteTags` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "noteTags" DROP CONSTRAINT "noteTags_notesId_fkey";

-- DropIndex
DROP INDEX "noteTags_notesId_idx";

-- AlterTable
ALTER TABLE "noteTags" DROP COLUMN "notesId";

-- CreateTable
CREATE TABLE "_NoteTagsToNotes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NoteTagsToNotes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_NoteTagsToNotes_B_index" ON "_NoteTagsToNotes"("B");

-- AddForeignKey
ALTER TABLE "_NoteTagsToNotes" ADD CONSTRAINT "_NoteTagsToNotes_A_fkey" FOREIGN KEY ("A") REFERENCES "noteTags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NoteTagsToNotes" ADD CONSTRAINT "_NoteTagsToNotes_B_fkey" FOREIGN KEY ("B") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
