-- CreateEnum
CREATE TYPE "Department" AS ENUM ('PRODUCT', 'CUSTOMER_SUCCESS', 'SALES', 'ENGINEERING', 'OPERATIONS', 'MARKETING', 'ANALYTICS', 'R_AND_D');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('JUNIOR', 'MID', 'SENIOR');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN "department" "Department",
ADD COLUMN "experienceLevel" "ExperienceLevel",
ADD COLUMN "salaryRange" TEXT;

-- AlterTable
ALTER TABLE "Theme" DROP COLUMN "ctaLabel",
DROP COLUMN "ctaUrl";

