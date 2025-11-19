import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompanyPublic } from "@/lib/data/company";
import { CareersPage } from "@/components/careers/careers-page";
import { filterJobs } from "@/lib/jobs";

export const revalidate = 60;
export const dynamic = "force-static";
export const dynamicParams = true;

type Params = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyPublic(slug);
  if (!company) {
    return {
      title: "Careers",
    };
  }

  return {
    title: `${company.name} Careers`,
    description: company.subheadline ?? company.headline,
  };
}

export default async function CompanyCareers({
  params,
  searchParams,
}: Params) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const company = await getCompanyPublic(slug);
  if (!company) {
    notFound();
  }

  const filters = {
    q:
      typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "",
    location:
      typeof resolvedSearchParams.location === "string"
        ? resolvedSearchParams.location
        : "all",
    jobType:
      typeof resolvedSearchParams.jobType === "string"
        ? resolvedSearchParams.jobType
        : "all",
  };

  const filteredJobs = filterJobs(company.jobs, filters);

  return (
    <>
      <CareersPage
        company={company}
        sections={company.sections}
        jobs={filteredJobs}
        allJobs={company.jobs}
        slug={company.slug}
        filters={filters}
        mode="public"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJobPostingSchema(company)),
        }}
      />
    </>
  );
}

function buildJobPostingSchema(
  company: NonNullable<Awaited<ReturnType<typeof getCompanyPublic>>>
) {
  return company.jobs.map((job) => ({
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.publishedAt?.toISOString(),
    employmentType: job.jobType,
    hiringOrganization: {
      "@type": "Organization",
      name: company.name,
      sameAs: company.website,
    },
    jobLocation: {
      "@type": "Place",
      address: job.location,
    },
    directApply: true,
    validThrough: new Date(
      job.publishedAt ? job.publishedAt.getTime() + 1000 * 60 * 60 * 24 * 60 : Date.now()
    ).toISOString(),
  }));
}

