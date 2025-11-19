import Image from "next/image";
import type { Job, Section, Theme, Company } from "@prisma/client";
import { JobFilterForm } from "./job-filter-form";
import { CompanyLogo } from "@/components/brand/company-logo";

type CareersPageProps = {
  company: Company & {
    theme: Theme | null;
  };
  sections: Section[];
  jobs: Job[];
  allJobs: Job[];
  slug: string;
  filters: {
    q: string;
    location: string;
    jobType: string;
  };
  mode: "public" | "preview";
};

export function CareersPage({
  company,
  sections,
  jobs,
  allJobs,
  slug,
  filters,
  mode,
}: CareersPageProps) {
  const locations = Array.from(new Set(allJobs.map((job) => job.location)));
  const jobTypes = Array.from(new Set(allJobs.map((job) => job.jobType)));
  const palette = {
    primary: company.theme?.primaryColor ?? "#0f172a",
    secondary: company.theme?.secondaryColor ?? "#0ea5e9",
    accent: company.theme?.accentColor ?? "#fbbf24",
    background: company.theme?.backgroundColor ?? "#f0fdfa",
  };
  const heroBackground =
    company.theme?.heroBackground ??
    `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: palette.background }}>
      <div className="mx-auto max-w-7xl space-y-12 p-4 md:p-8">
        {mode === "preview" && (
          <p className="rounded-full bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-700">
            Preview mode — this view includes draft sections and jobs.
          </p>
        )}
        <header
          className="overflow-hidden rounded-3xl border-4"
          style={{ borderColor: palette.primary }}
        >
        {company.theme?.bannerImageUrl ? (
          <div className="relative h-96">
            <Image
              src={company.theme.bannerImageUrl}
              alt={`${company.name} banner`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-8 text-white">
              <p className="text-sm uppercase tracking-[0.3em] text-white/90">
                {company.theme?.eyebrow ?? "Careers"}
              </p>
              <h1 className="mt-2 text-4xl font-semibold">{company.headline}</h1>
              {company.subheadline && (
                <p className="mt-2 text-lg text-white/90">
                  {company.subheadline}
                </p>
              )}
              <div className="mt-6">
                <CompanyLogo
                  src={company.theme?.logoUrl ?? undefined}
                  alt={`${company.name} logo`}
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            className="rounded-3xl p-8 text-white"
            style={{
              background: heroBackground,
            }}
          >
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">
              {company.theme?.eyebrow ?? "Careers"}
            </p>
            <h1 className="mt-4 text-4xl font-semibold">{company.headline}</h1>
            {company.subheadline && (
              <p className="mt-4 text-lg text-white/80">
                {company.subheadline}
              </p>
            )}
            <div className="mt-8">
              <CompanyLogo
                src={company.theme?.logoUrl ?? undefined}
                alt={`${company.name} logo`}
              />
            </div>
          </div>
        )}
        </header>

        <section className="space-y-6">
          <div
            className="grid gap-6 rounded-3xl border-2 bg-white p-8 shadow-lg md:grid-cols-2"
            style={{ borderColor: palette.secondary }}
          >
            <div className="space-y-3">
              <p
                className="text-sm font-bold uppercase tracking-[0.3em]"
                style={{ color: palette.primary }}
              >
                Mission
              </p>
              <p className="text-lg leading-relaxed text-slate-700">
                {company.mission ??
                  "Share your mission to help candidates understand why your work matters."}
              </p>
            </div>
            <div className="space-y-3">
              <p
                className="text-sm font-bold uppercase tracking-[0.3em]"
                style={{ color: palette.primary }}
              >
                Story
              </p>
              <p className="text-lg leading-relaxed text-slate-700">
                {company.story ??
                  "Tell the story of how your team works, what you value, and who thrives with you."}
              </p>
            </div>
          </div>
          {(() => {
            type InfoItem = { label: string; value: string; link?: boolean };
            const infoItems: InfoItem[] = [
              company.headquarters && { label: "Headquarters", value: company.headquarters },
              company.website && { label: "Website", value: company.website, link: true },
              company.sizeRange && { label: "Team size", value: company.sizeRange },
              company.industries?.length && {
                label: "Industries",
                value: company.industries.join(", "),
              },
            ].filter((item): item is InfoItem => Boolean(item));

            if (infoItems.length === 0) return null;

            return (
              <div
                className="grid gap-6 rounded-3xl border-2 bg-white p-6 shadow-md md:grid-cols-2 lg:grid-cols-4"
                style={{ borderColor: palette.accent }}
              >
                {infoItems.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <p
                      className="text-xs font-bold uppercase tracking-[0.3em]"
                      style={{ color: palette.accent }}
                    >
                      {item.label}
                    </p>
                    {item.link && item.value ? (
                      <a
                        href={formatWebsite(item.value)}
                        className="block break-words text-sm font-semibold underline underline-offset-4"
                        style={{ color: palette.primary }}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="break-words text-sm font-semibold text-slate-900">
                        {item.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
          <h2
            className="text-3xl font-bold"
            style={{ color: palette.primary }}
          >
            Open roles ({jobs.length})
          </h2>
        <JobFilterForm
          slug={slug}
          filters={filters}
          locations={locations}
          jobTypes={jobTypes}
          primaryColor={palette.primary}
        />
          <div id="open-roles" className="space-y-4">
            {jobs.map((job) => {
              const postedDate = job.publishedAt ?? job.createdAt;
              const daysAgo = Math.floor((Date.now() - new Date(postedDate).getTime()) / (1000 * 60 * 60 * 24));
              const timeAgoText = daysAgo === 0 ? "today" : daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`;
              
              return (
              <article
                key={job.id}
                className="rounded-2xl border-l-4 border-r border-b border-t bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                style={{ borderLeftColor: palette.secondary }}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h3
                      className="text-2xl font-bold"
                      style={{ color: palette.primary }}
                    >
                      {job.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {job.location} · {job.jobType.toLowerCase().replace(/_/g, ' ')} · {job.workSetting.toLowerCase()}
                      {job.department && ` · ${formatEnumValue(job.department)}`}
                      {job.experienceLevel && ` · ${formatEnumValue(job.experienceLevel)}`}
                    </p>
                    {job.salaryRange && (
                      <p className="text-sm font-semibold text-slate-700">
                        💰 {job.salaryRange}
                      </p>
                    )}
                    <p className="text-xs text-slate-500">
                      Posted {timeAgoText}
                    </p>
                    {mode === "preview" && job.status !== "PUBLISHED" && (
                      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        Draft
                      </span>
                    )}
                  </div>
                  <a
                    href={job.applyUrl}
                    className="inline-flex items-center rounded-full px-6 py-3 text-sm font-bold text-white shadow-md transition hover:shadow-lg hover:scale-105"
                    style={{ backgroundColor: palette.primary }}
                  >
                    Apply Now
                  </a>
                </div>
                <p className="mt-4 line-clamp-3 text-base text-slate-700">
                  {job.description}
                </p>
              </article>
            );
            })}
            {jobs.length === 0 && (
              <p className="text-sm text-slate-500">
                No jobs match these filters right now.
              </p>
            )}
          </div>
        </section>

        {sections.length > 0 && (
          <>
            <h2
              className="text-3xl font-bold"
              style={{ color: palette.primary }}
            >
              Why Join Us
            </h2>

            <section className="grid gap-6">
              {sections.map((section) => (
                <article
                  key={section.id}
                  className="rounded-2xl border-2 bg-white p-8 shadow-lg transition hover:shadow-xl"
                  style={{ borderColor: palette.secondary }}
                >
                  <div
                    className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.3em]"
                    style={{ backgroundColor: palette.accent, color: "white" }}
                  >
                    {section.title}
                  </div>
                  {section.summary && (
                    <p className="mt-3 text-sm font-medium text-slate-600">
                      {section.summary}
                    </p>
                  )}
                  <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-slate-700">
                    {section.content}
                  </p>
                </article>
              ))}
            </section>
          </>
        )}
        {company.theme?.cultureVideoUrl && (
          <section>
            <div
              className="aspect-video w-full overflow-hidden rounded-3xl border-4 shadow-xl"
              style={{ borderColor: palette.accent }}
            >
              <iframe
                src={company.theme.cultureVideoUrl}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Culture video"
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function formatWebsite(url: string) {
  if (!url) {
    return "#";
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
}

function formatEnumValue(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

