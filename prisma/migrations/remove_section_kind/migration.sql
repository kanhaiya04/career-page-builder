-- AlterTable
ALTER TABLE "Section" DROP COLUMN IF EXISTS "kind";

-- DropEnum
DROP TYPE IF EXISTS "SectionType";

