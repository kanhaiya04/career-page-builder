-- AlterEnum
-- Remove ARCHIVED from JobStatus enum
-- This requires creating a new enum type, updating the column, and dropping the old type

-- Create new enum type without ARCHIVED
CREATE TYPE "JobStatus_new" AS ENUM ('DRAFT', 'PUBLISHED');

-- Update any ARCHIVED jobs to DRAFT (or you could choose PUBLISHED)
UPDATE "Job" SET status = 'DRAFT' WHERE status = 'ARCHIVED';

-- Alter the column to use the new enum type
ALTER TABLE "Job" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Job" ALTER COLUMN "status" TYPE "JobStatus_new" USING (status::text::"JobStatus_new");
ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- Drop the old enum type and rename the new one
DROP TYPE "JobStatus";
ALTER TYPE "JobStatus_new" RENAME TO "JobStatus";

