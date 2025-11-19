import type { Job, JobStatus } from "@prisma/client";

export type JobFilters = {
  q?: string;
  location?: string;
  jobType?: string;
  status?: JobStatus | "all";
};

export function filterJobs(jobs: Job[], filters: JobFilters) {
  return jobs.filter((job) => {
    const matchesQuery = filters.q
      ? job.title.toLowerCase().includes(filters.q.toLowerCase())
      : true;
    const matchesLocation =
      !filters.location ||
      filters.location === "all" ||
      job.location === filters.location;
    const matchesJobType =
      !filters.jobType ||
      filters.jobType === "all" ||
      job.jobType === filters.jobType;
    const matchesStatus =
      !filters.status ||
      filters.status === "all" ||
      job.status === filters.status;

    return matchesQuery && matchesLocation && matchesJobType && matchesStatus;
  });
}

