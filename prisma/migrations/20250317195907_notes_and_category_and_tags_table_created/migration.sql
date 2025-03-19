/*
  Warnings:

  - The `files` column on the `notes` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "notes" DROP COLUMN "files",
ADD COLUMN     "files" TEXT[];
