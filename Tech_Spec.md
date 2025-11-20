## 1. Architecture

```
Next.js App Router
├── (auth)/login              Recruiter login, server-rendered
├── [slug]/edit               Editor dashboard (client-side interactions)
├── [slug]/preview            Auth-only preview, shows unsaved changes from localStorage
├── [slug]/careers            Public SSR careers site (SEO optimized)
└── api/…                     Route handlers for auth + CRUD

Prisma/PostgreSQL
└── Company ─ Theme ─ Section ─ Job ─ Recruiter
```

The Theme model stores all the branding stuff—colors, logo, banner images, that kind of thing. Sections are just content blocks that can be reordered. Jobs have a status field (DRAFT or PUBLISHED) that controls visibility on the public site.

All the API routes use the same authorization guard (`authorizeApiCompany`) that checks the JWT session and makes sure the recruiter belongs to the company they're trying to access. The UI is built with shadcn components and Tailwind CSS.

## 2. Data Model

| Table | Purpose | Key Fields |
| --- | --- | --- |
| `Company` | Core company info | `slug`, `name`, `headline`, `subheadline`, `story`, `mission`, `headquarters`, `website`, `sizeRange`, `values JSON` |
| `Theme` | Branding & visual assets | `primaryColor`, `secondaryColor`, `accentColor`, `backgroundColor`, `heroBackground`, `bannerImageUrl`, `logoUrl`, `cultureVideoUrl` |
| `Section` | Custom content blocks | `title`, `slug`, `summary`, `content`, `sortOrder` |
| `Job` | Job postings | `title`, `slug`, `location`, `jobType`, `workSetting`, `description`, `applyUrl`, `status`, `tags[]`, `featured`, `department`, `experienceLevel`, `salaryRange`, `publishedAt` |
| `Recruiter` | User accounts | `name`, `email`, `role`, `passcodeHash`, `companyId`, `lastLoginAt` |

Sections don't have publish flags—they're always visible once created. Jobs use a status enum (DRAFT/PUBLISHED) to control visibility. When a job is published, we set the `publishedAt` timestamp.

We've got enums for job type (FULL_TIME, PART_TIME, CONTRACT, etc.), work setting (REMOTE, HYBRID, ONSITE), recruiter role (OWNER, EDITOR, VIEWER), department (ENGINEERING, PRODUCT, SALES, etc.), and experience level (JUNIOR, MID, SENIOR).

## 3. API Routes

| Route | Method | Description |
| --- | --- | --- |
| `/api/auth/login` | POST | Validates email + passcode, creates session cookie |
| `/api/auth/logout` | POST | Clears the session cookie |
| `/api/auth/me` | GET | Returns current recruiter + company info |
| `/api/companies/[slug]/theme` | GET/PATCH | Fetch or update company + theme settings |
| `/api/companies/[slug]/sections` | GET/POST | List all sections or create a new one |
| `/api/companies/[slug]/sections/[id]` | PATCH/DELETE | Update or delete a section |
| `/api/companies/[slug]/jobs` | GET/POST | List jobs (optional status filter) or create a new job |
| `/api/companies/[slug]/jobs/[id]` | PATCH/DELETE | Update or delete a job |

All the mutation routes use `authorizeApiCompany` which checks the session and verifies company ownership.
