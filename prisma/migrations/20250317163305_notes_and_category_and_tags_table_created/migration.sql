/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tagName,userId]` on the table `noteTags` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "categories_name_userId_key" ON "categories"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "noteTags_tagName_userId_key" ON "noteTags"("tagName", "userId");
