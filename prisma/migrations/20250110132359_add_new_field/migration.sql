-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'IN_PROCESS';

-- AlterTable
ALTER TABLE "Rent" ADD COLUMN     "isRentExtended" BOOLEAN DEFAULT false,
ALTER COLUMN "isGuaranteeReturned" SET DEFAULT false;
