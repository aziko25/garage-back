/*
  Warnings:

  - Added the required column `isGuaranteeReturned` to the `Rent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Rent" ADD COLUMN "isGuaranteeReturned" BOOLEAN DEFAULT FALSE;
UPDATE "Rent" SET "isGuaranteeReturned" = FALSE WHERE "isGuaranteeReturned" IS NULL;
ALTER TABLE "Rent" ALTER COLUMN "isGuaranteeReturned" SET NOT NULL;

