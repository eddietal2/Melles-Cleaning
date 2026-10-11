-- AlterTable
ALTER TABLE "QuoteLineItem" ADD COLUMN "title" TEXT NOT NULL DEFAULT '';

-- Backfill the new title from the existing description so older quotes keep reading well.
UPDATE "QuoteLineItem" SET "title" = "description" WHERE "title" = '';
