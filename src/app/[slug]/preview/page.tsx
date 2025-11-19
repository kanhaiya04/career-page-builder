import { notFound } from "next/navigation";
import { requireCompanyPreview } from "@/lib/auth/guards";
import { getCompanyForEditor } from "@/lib/data/company";
import { PreviewWrapper } from "@/components/careers/preview-wrapper";
import { filterJobs } from "@/lib/jobs";

type Params = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PreviewPage({ params, searchParams }: Params) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  await requireCompanyPreview(slug);
  const company = await getCompanyForEditor(slug);
  if (!company) {
    notFound();
  }

  const filters = {
    q:
      typeof resolvedSearchParams.q === "string"
        ? resolvedSearchParams.q
        : "",
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
    <PreviewWrapper
      company={company}
      sections={company.sections}
      jobs={filteredJobs}
      allJobs={company.jobs}
      slug={company.slug}
      filters={filters}
    />
  );
}

