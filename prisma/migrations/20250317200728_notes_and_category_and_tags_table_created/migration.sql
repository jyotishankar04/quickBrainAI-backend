/*
  Warnings:

  - You are about to drop the `_noteTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_noteTags" DROP CONSTRAINT "_noteTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_noteTags" DROP CONSTRAINT "_noteTags_B_fkey";

-- DropTable
DROP TABLE "_noteTags";

-- CreateTable
CREATE TABLE "noteTagOnNotes" (
    "noteId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "noteTagOnNotes_pkey" PRIMARY KEY ("noteId","tagId")
);

-- AddForeignKey
ALTER TABLE "noteTagOnNotes" ADD CONSTRAINT "noteTagOnNotes_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "noteTagOnNotes" ADD CONSTRAINT "noteTagOnNotes_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "noteTags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
