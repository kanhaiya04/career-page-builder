-- Update existing NULL values with defaults
UPDATE "Job" 
SET 
  "department" = 'ENGINEERING'
WHERE "department" IS NULL;

UPDATE "Job" 
SET 
  "experienceLevel" = 'MID'
WHERE "experienceLevel" IS NULL;

UPDATE "Job" 
SET 
  "salaryRange" = 'Competitive'
WHERE "salaryRange" IS NULL;

-- AlterTable: Make columns required with defaults
ALTER TABLE "Job" 
  ALTER COLUMN "department" SET NOT NULL,
  ALTER COLUMN "department" SET DEFAULT 'ENGINEERING',
  ALTER COLUMN "experienceLevel" SET NOT NULL,
  ALTER COLUMN "experienceLevel" SET DEFAULT 'MID',
  ALTER COLUMN "salaryRange" SET NOT NULL;

