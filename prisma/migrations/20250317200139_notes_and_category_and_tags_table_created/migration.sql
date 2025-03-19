/*
  Warnings:

  - You are about to drop the `_NoteTagsToNotes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_NoteTagsToNotes" DROP CONSTRAINT "_NoteTagsToNotes_A_fkey";

-- DropForeignKey
ALTER TABLE "_NoteTagsToNotes" DROP CONSTRAINT "_NoteTagsToNotes_B_fkey";

-- DropTable
DROP TABLE "_NoteTagsToNotes";

-- CreateTable
CREATE TABLE "_noteTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_noteTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_noteTags_B_index" ON "_noteTags"("B");

-- AddForeignKey
ALTER TABLE "_noteTags" ADD CONSTRAINT "_noteTags_A_fkey" FOREIGN KEY ("A") REFERENCES "noteTags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_noteTags" ADD CONSTRAINT "_noteTags_B_fkey" FOREIGN KEY ("B") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
