"use client";

import { useMemo, useState, useTransition } from "react";
import type { Company, Job, Section, Theme } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeDesigner } from "./theme-designer";
import { JobsManager } from "./jobs-manager";
import { LogOut, Briefcase, FileText, TrendingUp, Building2 } from "lucide-react";

type EditorShellProps = {
  company: Company & {
    theme: Theme | null;
    sections: Section[];
    jobs: Job[];
  };
};

export function EditorShell({ company }: EditorShellProps) {
  const [companyMeta, setCompanyMeta] = useState<Company>(company);
  const [theme, setTheme] = useState<Theme | null>(company.theme);
  const [sections, setSections] = useState<Section[]>(company.sections);
  const [jobs, setJobs] = useState<Job[]>(company.jobs);
  const [isLoggingOut, startLogout] = useTransition();

  const stats = useMemo(() => {
    const publishedJobs = jobs.filter((job) => job.status === "PUBLISHED");
    const draftJobs = jobs.filter((job) => job.status !== "PUBLISHED");
    return {
      publishedJobs: publishedJobs.length,
      draftJobs: draftJobs.length,
      sections: sections.length,
    };
  }, [jobs, sections]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <Badge className="text-base px-4 py-1.5 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 hover:from-emerald-100 hover:to-green-100 border-emerald-200">
                {company.name}
              </Badge>
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {companyMeta.headline}
              </h1>
              {companyMeta.subheadline && (
                <p className="text-lg text-slate-600">{companyMeta.subheadline}</p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            disabled={isLoggingOut}
            onClick={() =>
              startLogout(async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/login";
              })
            }
            className="gap-2 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
          >
            {isLoggingOut ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                Signing out…
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Sign Out
              </>
            )}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-slate-600">
                Published Jobs
              </CardTitle>
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.publishedJobs}</div>
              <p className="text-xs text-slate-500 mt-1">Active listings</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-slate-600">
                Draft Jobs
              </CardTitle>
              <div className="p-2 rounded-lg bg-amber-100">
                <Briefcase className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.draftJobs}</div>
              <p className="text-xs text-slate-500 mt-1">Pending publication</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-slate-600">
                Content Sections
              </CardTitle>
              <div className="p-2 rounded-lg bg-purple-100">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.sections}</div>
              <p className="text-xs text-slate-500 mt-1">Custom sections</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="brand" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="brand">Brand & Content</TabsTrigger>
          <TabsTrigger value="jobs">Open roles</TabsTrigger>
        </TabsList>
        <TabsContent value="brand">
          <ThemeDesigner
            company={companyMeta}
            theme={theme}
            sections={sections}
            slug={company.slug}
            onUpdated={(updated, updatedSections) => {
              setCompanyMeta(updated);
              setTheme(updated.theme);
              setSections(updatedSections);
            }}
          />
        </TabsContent>
        <TabsContent value="jobs">
          <JobsManager
            slug={company.slug}
            jobs={jobs}
            onChange={(next) => setJobs(next)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

