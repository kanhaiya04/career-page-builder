# Career Page Builder

A platform for recruiters to build and customize their company's careers page. Create branded pages, manage job postings, and publish everything with a simple editor.

## What's Built

- **Custom career pages** - Each company gets a unique page at `/[slug]/careers`
- **Theme editor** - Customize colors, logos, banners, and branding
- **Job management** - Create, edit, and publish job postings with filters
- **Content sections** - Add custom content blocks that can be reordered
- **Preview mode** - See changes before publishing (saved to localStorage)
- **Auth system** - Passcode-based login for recruiters with role-based access

Built with Next.js, Prisma, PostgreSQL, and shadcn/ui.

## How to Run

1. Install dependencies:
```bash
npm install
```

2. Set up your database. Add a `.env` file with:
```
DATABASE_URL="your-postgres-connection-string"
DIRECT_URL="your-direct-connection-string"
JWT_SECRET="your-secret-key"
```

3. Run migrations:
```bash
npm run db:push
npm run db:generate
```

4. Start the dev server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to get started.

## User Guide

### First Time Setup

1. Go to `/signup` and create a recruiter account
2. Fill in your company details (name, slug, headline, etc.)
3. You'll be redirected to the editor at `/[your-slug]/edit`

### Customizing Your Page

1. **Theme tab** - Set your brand colors, upload logo and banner images
2. **Sections tab** - Add content blocks (About, Culture, Benefits, etc.). Drag to reorder
3. **Jobs tab** - Create job postings. Set status to DRAFT or PUBLISHED
4. **Preview tab** - Click to see how your page looks at `/[slug]/careers`

### Publishing Jobs

- Jobs with status `PUBLISHED` appear on the public careers page
- `DRAFT` jobs are only visible in the editor
- Use filters on the public page to find jobs by department, location, or type

### Preview Changes

Changes in the editor are saved to localStorage. Use the preview page to see them before hitting save. The preview shows unsaved changes that won't appear on the live site until you save.

## Improvement Plan

- [ ] Image upload/management instead of URL inputs
- [ ] Analytics dashboard for job views and applications
- [ ] End to end testing for application
- [ ] Integration with ATS systems
- [ ] Multi-language support
