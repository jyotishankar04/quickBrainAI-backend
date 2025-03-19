/*
  Warnings:

  - A unique constraint covering the columns `[tagName]` on the table `noteTags` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "noteTags_tagName_key" ON "noteTags"("tagName");
