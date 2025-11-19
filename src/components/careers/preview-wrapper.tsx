"use client";

import { useEffect, useState, useCallback } from "react";
import type { Company, Theme, Section, Job } from "@prisma/client";
import { CareersPage } from "./careers-page";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type ThemeFormValues = {
  headline: string;
  subheadline?: string;
  mission?: string;
  story?: string;
  headquarters?: string;
  website?: string;
  sizeRange?: string;
  industries?: string[];
  showSalary?: boolean;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    heroBackground?: string;
    bannerImageUrl?: string;
    logoUrl?: string;
    cultureVideoUrl?: string;
    eyebrow?: string;
  };
};

type PreviewWrapperProps = {
  company: Company & { theme: Theme | null; sections: Section[]; jobs: Job[] };
  sections: Section[];
  jobs: Job[];
  allJobs: Job[];
  slug: string;
  filters: {
    q: string;
    location: string;
    jobType: string;
  };
};

export function PreviewWrapper({
  company: initialCompany,
  sections: initialSections,
  jobs,
  allJobs,
  slug,
  filters,
}: PreviewWrapperProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewData, setPreviewData] = useState<{
    company: Company & { theme: Theme | null };
    sections: Section[];
  }>({
    company: initialCompany,
    sections: initialSections,
  });

  const loadPreviewData = useCallback(() => {
    const themeKey = `preview-theme-${slug}`;
    const sectionsKey = `preview-sections-${slug}`;
    
    const storedTheme = localStorage.getItem(themeKey);
    const storedSections = localStorage.getItem(sectionsKey);

    let hasChanges = false;
    let updatedCompany = initialCompany;
    let updatedSections = initialSections;

    if (storedTheme) {
      try {
        const unsavedTheme: ThemeFormValues = JSON.parse(storedTheme);
        
        updatedCompany = {
          ...updatedCompany,
          headline: unsavedTheme.headline,
          subheadline: unsavedTheme.subheadline || null,
          mission: unsavedTheme.mission || null,
          story: unsavedTheme.story || null,
          headquarters: unsavedTheme.headquarters || null,
          website: unsavedTheme.website || null,
          sizeRange: unsavedTheme.sizeRange || null,
          industries: unsavedTheme.industries ?? [],
          showSalary: unsavedTheme.showSalary ?? true,
          theme: {
            id: initialCompany.theme?.id ?? "",
            companyId: initialCompany.id,
            primaryColor: unsavedTheme.theme.primaryColor,
            secondaryColor: unsavedTheme.theme.secondaryColor,
            accentColor: unsavedTheme.theme.accentColor,
            backgroundColor: unsavedTheme.theme.backgroundColor,
            heroBackground: unsavedTheme.theme.heroBackground || null,
            bannerImageUrl: unsavedTheme.theme.bannerImageUrl || null,
            logoUrl: unsavedTheme.theme.logoUrl || null,
            cultureVideoUrl: unsavedTheme.theme.cultureVideoUrl || null,
            eyebrow: unsavedTheme.theme.eyebrow || null,
            createdAt: initialCompany.theme?.createdAt ?? new Date(),
            updatedAt: initialCompany.theme?.updatedAt ?? new Date(),
          },
        };
        hasChanges = true;
      } catch (error) {
        console.error("Failed to parse theme preview data:", error);
      }
    }

    if (storedSections) {
      try {
        const unsavedSections: Section[] = JSON.parse(storedSections);
        updatedSections = unsavedSections;
        hasChanges = true;
      } catch (error) {
        console.error("Failed to parse sections preview data:", error);
      }
    }

    setPreviewData({
      company: updatedCompany,
      sections: updatedSections,
    });
    setHasUnsavedChanges(hasChanges);
  }, [slug, initialCompany, initialSections]);

  useEffect(() => {
    loadPreviewData();
  }, [loadPreviewData]);

  return (
    <>
      {hasUnsavedChanges && (
        <div className="rounded-lg bg-blue-50 p-4 border-2 border-blue-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-center">
              <p className="text-sm font-semibold text-blue-900">
                ⚡ Showing unsaved changes
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Go back to the editor and click "Save all changes" to make these changes permanent
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPreviewData}
              className="shrink-0 bg-white hover:bg-blue-100 border-blue-300"
              title="Refresh preview to load latest changes from editor"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      )}
      <CareersPage
        company={previewData.company}
        sections={previewData.sections}
        jobs={jobs}
        allJobs={allJobs}
        slug={slug}
        filters={filters}
        mode="preview"
      />
    </>
  );
}

