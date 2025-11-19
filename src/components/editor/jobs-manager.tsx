"use client";

import { useMemo, useState, useTransition } from "react";
import type { Job } from "@prisma/client";
import { JobStatus, JobType, WorkSetting, Department, ExperienceLevel } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Plus, Eye, Trash2, MapPin, Clock, Building, CheckCircle2, XCircle } from "lucide-react";

const statusFilters = [
  { label: "All", value: "ALL" },
  { label: "Published", value: JobStatus.PUBLISHED },
  { label: "Draft", value: JobStatus.DRAFT },
];

const jobTypeOptions = Object.values(JobType);
const workSettings = Object.values(WorkSetting);
const departments = Object.values(Department);
const experienceLevels = Object.values(ExperienceLevel);

type JobsManagerProps = {
  slug: string;
  jobs: Job[];
  onChange: (jobs: Job[]) => void;
};

type NewJobForm = {
  title: string;
  location: string;
  jobType: JobType;
  workSetting: WorkSetting;
  description: string;
  applyUrl: string;
  status: JobStatus;
  tags: string;
  department: Department;
  experienceLevel: ExperienceLevel;
  salaryRange: string;
};

export function JobsManager({ slug, jobs, onChange }: JobsManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]["value"]>("ALL");
  const [isPending, startTransition] = useTransition();
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<"update" | "delete" | null>(null);
  const [newJob, setNewJob] = useState<NewJobForm>({
    title: "",
    location: "",
    jobType: JobType.FULL_TIME,
    workSetting: WorkSetting.HYBRID,
    description: "",
    applyUrl: "",
    status: JobStatus.DRAFT,
    tags: "",
    department: Department.ENGINEERING,
    experienceLevel: ExperienceLevel.MID,
    salaryRange: "",
  });

  const filteredJobs = useMemo(() => {
    if (statusFilter === "ALL") return jobs;
    return jobs.filter((job) => job.status === statusFilter);
  }, [jobs, statusFilter]);

  const resetJobForm = () =>
    setNewJob({
      title: "",
      location: "",
      jobType: JobType.FULL_TIME,
      workSetting: WorkSetting.HYBRID,
      description: "",
      applyUrl: "",
      status: JobStatus.DRAFT,
      tags: "",
      department: Department.ENGINEERING,
      experienceLevel: ExperienceLevel.MID,
      salaryRange: "",
    });

  const createJob = () => {
    startTransition(async () => {
      try {
        const payload = {
          ...newJob,
          tags: newJob.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        };
        const response = await fetch(`/api/companies/${slug}/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Unable to create job");
        }
        onChange([data.job, ...jobs]);
        toast.success("Job created");
        resetJobForm();
        setDialogOpen(false);
      } catch (error) {
        toast.error("Create failed", {
          description:
            error instanceof Error ? error.message : "Please try again",
        });
      }
    });
  };

  const updateJob = (id: string, payload: Partial<Job>) => {
    setLoadingJobId(id);
    setLoadingAction("update");
    startTransition(async () => {
      try {
        const response = await fetch(`/api/companies/${slug}/jobs/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Unable to update job");
        }
        onChange(jobs.map((job) => (job.id === id ? data.job : job)));
      } catch (error) {
        toast.error("Update failed", {
          description:
            error instanceof Error ? error.message : "Please try again",
        });
      } finally {
        setLoadingJobId(null);
        setLoadingAction(null);
      }
    });
  };

  const deleteJob = (id: string) => {
    setLoadingJobId(id);
    setLoadingAction("delete");
    startTransition(async () => {
      try {
        const response = await fetch(`/api/companies/${slug}/jobs/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Unable to delete job");
        }
        onChange(jobs.filter((job) => job.id !== id));
        toast.success("Job deleted");
      } catch (error) {
        toast.error("Delete failed", {
          description:
            error instanceof Error ? error.message : "Please try again",
        });
      } finally {
        setLoadingJobId(null);
        setLoadingAction(null);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Open Roles</h1>
          <p className="text-sm text-slate-600 mt-1">Manage your job postings</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="h-4 w-4" />
              Add Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Post a New Job
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 pt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Job Details</h3>
                </div>
                <TextField
                  label="Job Title"
                  value={newJob.title}
                  onChange={(value) =>
                    setNewJob((prev) => ({ ...prev, title: value }))
                  }
                  placeholder="e.g., Senior Software Engineer"
                />
                <TextField
                  label="Location"
                  value={newJob.location}
                  onChange={(value) =>
                    setNewJob((prev) => ({ ...prev, location: value }))
                  }
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Employment Type</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectField
                    label="Job Type"
                    value={newJob.jobType}
                    options={jobTypeOptions}
                    onChange={(value) =>
                      setNewJob((prev) => ({
                        ...prev,
                        jobType: value as JobType,
                      }))
                    }
                  />
                  <SelectField
                    label="Work Setting"
                    value={newJob.workSetting}
                    options={workSettings}
                    onChange={(value) =>
                      setNewJob((prev) => ({
                        ...prev,
                        workSetting: value as WorkSetting,
                      }))
                    }
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Role Details</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectField
                    label="Department"
                    value={newJob.department}
                    options={departments}
                    onChange={(value) =>
                      setNewJob((prev) => ({
                        ...prev,
                        department: value as Department,
                      }))
                    }
                  />
                  <SelectField
                    label="Experience Level"
                    value={newJob.experienceLevel}
                    options={experienceLevels}
                    onChange={(value) =>
                      setNewJob((prev) => ({
                        ...prev,
                        experienceLevel: value as ExperienceLevel,
                      }))
                    }
                  />
                </div>
                <TextField
                  label="Salary Range"
                  value={newJob.salaryRange}
                  onChange={(value) =>
                    setNewJob((prev) => ({ ...prev, salaryRange: value }))
                  }
                  placeholder="e.g., $80,000 - $120,000"
                />
              </div>
              
              <div className="space-y-4">
                <TextField
                  label="Application URL"
                  value={newJob.applyUrl}
                  onChange={(value) =>
                    setNewJob((prev) => ({ ...prev, applyUrl: value }))
                  }
                  placeholder="https://..."
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Job Description</Label>
                <Textarea
                  rows={6}
                  value={newJob.description}
                  onChange={(event) =>
                    setNewJob((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  placeholder="Describe the role, responsibilities, and requirements..."
                />
              </div>
              
              <TextField
                label="Tags (comma separated)"
                value={newJob.tags}
                onChange={(value) =>
                  setNewJob((prev) => ({ ...prev, tags: value }))
                }
                placeholder="e.g., React, TypeScript, Remote"
              />
              
              <SelectField
                label="Status"
                value={newJob.status}
                options={Object.values(JobStatus)}
                onChange={(value) =>
                  setNewJob((prev) => ({
                    ...prev,
                    status: value as JobStatus,
                  }))
                }
              />
              
              <div className="flex gap-3 pt-2">
                <Button 
                  disabled={isPending} 
                  onClick={createJob}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isPending ? (
                    <>
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                      Creating…
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Job
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Jobs List Card */}
      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Job Listings</CardTitle>
                <CardDescription>
                  {jobs.length} {jobs.length === 1 ? 'position' : 'positions'} total
                </CardDescription>
              </div>
            </div>
            <Tabs
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as (typeof statusFilters)[number]["value"])
              }
            >
              <TabsList className="bg-white border border-slate-200">
                {statusFilters.map((filter) => (
                  <TabsTrigger 
                    key={filter.value} 
                    value={filter.value}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
                  >
                    {filter.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredJobs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow key={job.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-slate-400" />
                          <span className="font-semibold text-slate-900">{job.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Building className="h-3.5 w-3.5" />
                          <span className="text-sm">{job.jobType.toLowerCase().replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            job.status === JobStatus.PUBLISHED
                              ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700"
                              : "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600"
                          }`}
                        >
                          {job.status === JobStatus.PUBLISHED ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {job.status.toLowerCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={loadingJobId === job.id || isPending}
                            onClick={() =>
                              updateJob(job.id, {
                                status:
                                  job.status === JobStatus.PUBLISHED
                                    ? JobStatus.DRAFT
                                    : JobStatus.PUBLISHED,
                              })
                            }
                            className={`gap-1.5 ${
                              job.status === JobStatus.PUBLISHED
                                ? "hover:bg-slate-50 hover:text-slate-700"
                                : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                            }`}
                          >
                            {loadingJobId === job.id && loadingAction === "update" ? (
                              <>
                                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                                {job.status === JobStatus.PUBLISHED ? "Unpublishing..." : "Publishing..."}
                              </>
                            ) : (
                              <>
                                {job.status === JobStatus.PUBLISHED ? (
                                  <>
                                    <XCircle className="h-3.5 w-3.5" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Publish
                                  </>
                                )}
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={loadingJobId === job.id || isPending}
                            onClick={() => deleteJob(job.id)}
                          >
                            {loadingJobId === job.id && loadingAction === "delete" ? (
                              <>
                                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-slate-100 p-4 mb-4">
                <Briefcase className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900 mb-1">
                {statusFilter === "ALL" 
                  ? "No jobs posted yet" 
                  : `No ${statusFilter.toLowerCase()} jobs`}
              </p>
              <p className="text-sm text-slate-500">
                {statusFilter === "ALL"
                  ? "Click \"Add Job\" to create your first job posting"
                  : "Try changing the filter or add a new job"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
        placeholder={placeholder}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option.toLowerCase().replace(/_/g, ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

