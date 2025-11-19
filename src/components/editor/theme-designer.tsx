"use client";

import { useTransition, useEffect, useState, useRef } from "react";
import type { Company, Theme, Section } from "@prisma/client";
import {
  useForm,
  type SubmitHandler,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { themeUpdateSchema } from "@/lib/validators/company";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, Trash2, ArrowUp, ArrowDown, Plus, Palette, FileText, Image, Link2, Sparkles, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Form values type (before zod transformations)
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

type ThemeDesignerProps = {
  company: Company;
  theme: Theme | null;
  sections: Section[];
  slug: string;
  onUpdated: (company: Company & { theme: Theme | null }, sections: Section[]) => void;
};

export function ThemeDesigner({
  company,
  theme,
  sections: initialSections,
  slug,
  onUpdated,
}: ThemeDesignerProps) {
  const [isPending, startTransition] = useTransition();
  const [localSections, setLocalSections] = useState<Section[]>(initialSections);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSection, setNewSection] = useState({
    title: "",
    summary: "",
    content: "",
  });
  
  const form = useForm<ThemeFormValues>({
    resolver: zodResolver(themeUpdateSchema),
    defaultValues: {
      headline: company.headline,
      subheadline: company.subheadline ?? undefined,
      mission: company.mission ?? undefined,
      story: company.story ?? undefined,
      headquarters: company.headquarters ?? undefined,
      website: company.website ?? undefined,
      sizeRange: company.sizeRange ?? undefined,
      industries: company.industries ?? [],
      showSalary: company.showSalary,
      theme: {
        primaryColor: theme?.primaryColor ?? "#0f172a",
        secondaryColor: theme?.secondaryColor ?? "#10b981",
        accentColor: theme?.accentColor ?? "#fbbf24",
        backgroundColor: theme?.backgroundColor ?? "#f0fdfa",
        heroBackground: theme?.heroBackground ?? undefined,
        bannerImageUrl: theme?.bannerImageUrl ?? undefined,
        logoUrl: theme?.logoUrl ?? undefined,
        cultureVideoUrl: theme?.cultureVideoUrl ?? undefined,
        eyebrow: theme?.eyebrow ?? undefined,
      },
    },
  });

  // Store form changes in localStorage without causing re-renders
  // Using localStorage (not sessionStorage) so preview tabs can access the data even after refresh
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  
  useEffect(() => {
    // Subscribe to form changes without causing re-renders
    const subscription = form.watch((values) => {
      // Clear any pending saves
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Debounce the localStorage writes to prevent lag during color picker drag
      saveTimeoutRef.current = setTimeout(() => {
        const storageKey = `preview-theme-${slug}`;
        const sectionsKey = `preview-sections-${slug}`;
        localStorage.setItem(storageKey, JSON.stringify(values));
        localStorage.setItem(sectionsKey, JSON.stringify(localSections));
      }, 150); // 150ms delay after user stops typing/dragging
    });

    return () => {
      subscription.unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [form, localSections, slug]);

  // Save sections to localStorage whenever they change
  useEffect(() => {
    const sectionsKey = `preview-sections-${slug}`;
    localStorage.setItem(sectionsKey, JSON.stringify(localSections));
  }, [localSections, slug]);

  const onSubmit: SubmitHandler<ThemeFormValues> = (values) => {
    startTransition(async () => {
      try {
        // Save theme
        const themeResponse = await fetch(`/api/companies/${slug}/theme`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const themeData = await themeResponse.json();
        if (!themeResponse.ok) {
          throw new Error(themeData.error ?? "Unable to save theme");
        }

        // Save sections - compare with initial and make necessary API calls
        const sectionsToSave = localSections;
        const savedSections: Section[] = [];
        
        for (const section of sectionsToSave) {
          if (section.id.startsWith('temp-')) {
            // New section - create it
            const response = await fetch(`/api/companies/${slug}/sections`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: section.title,
                slug: section.slug,
                summary: section.summary,
                content: section.content,
                sortOrder: section.sortOrder,
              }),
            });
            const data = await response.json();
            if (response.ok) {
              savedSections.push(data.section);
            }
          } else {
            // Existing section - update it
            const response = await fetch(`/api/companies/${slug}/sections/${section.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: section.title,
                slug: section.slug,
                summary: section.summary,
                content: section.content,
                sortOrder: section.sortOrder,
              }),
            });
            const data = await response.json();
            if (response.ok) {
              savedSections.push(data.section);
            }
          }
        }

        // Delete sections that were removed
        const initialSectionIds = initialSections.map(s => s.id);
        const localSectionIds = localSections.map(s => s.id);
        const deletedIds = initialSectionIds.filter(id => !localSectionIds.includes(id));
        
        for (const id of deletedIds) {
          await fetch(`/api/companies/${slug}/sections/${id}`, {
            method: "DELETE",
          });
        }

        onUpdated(themeData.company, savedSections);
        
        // Update local sections with the saved sections (which have real IDs from the database)
        setLocalSections(savedSections);
        
        // Clear unsaved changes from localStorage after successful save
        localStorage.removeItem(`preview-theme-${slug}`);
        localStorage.removeItem(`preview-sections-${slug}`);
        
        toast.success("Saved successfully", {
          description: "Your brand and content are now live.",
        });
      } catch (error) {
        toast.error("Save failed", {
          description:
            error instanceof Error ? error.message : "Please try again",
        });
      }
    });
  };

  const handlePreviewChanges = () => {
    // Open preview in new tab - it will read from sessionStorage
    window.open(`/${slug}/preview`, "_blank");
    toast.info("Preview opened", {
      description: "Showing your unsaved changes",
    });
  };

  // Section management functions
  const addSection = () => {
    const tempId = `temp-${Date.now()}`;
    const slug = newSection.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const newSec: Section = {
      id: tempId,
      companyId: company.id,
      slug: slug || `section-${Date.now()}`,
      title: newSection.title,
      summary: newSection.summary || null,
      content: newSection.content,
      sortOrder: localSections.length * 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setLocalSections([...localSections, newSec]);
    setNewSection({ title: "", summary: "", content: "" });
    setDialogOpen(false);
    toast.success("Section added (not saved yet)");
  };

  const deleteSection = (id: string) => {
    setLocalSections(localSections.filter(s => s.id !== id));
    toast.success("Section removed (not saved yet)");
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= localSections.length) return;

    const reordered = [...localSections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    // Update sortOrder
    const updated = reordered.map((section, idx) => ({
      ...section,
      sortOrder: idx * 10,
    }));

    setLocalSections(updated);
  };

  const orderedSections = [...localSections].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit Career Page</h1>
          <p className="text-sm text-slate-600 mt-1">Customize your brand and content</p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreviewChanges}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button
            disabled={isPending}
            onClick={form.handleSubmit(onSubmit)}
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isPending ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Brand Identity Section */}
      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Brand & Storytelling</CardTitle>
              <CardDescription>Define your company&apos;s narrative and identity</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Hero Content */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Headline & Subheadline</h3>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="headline" className="text-sm font-medium text-slate-700">Headline</Label>
                  <Input 
                    id="headline" 
                    {...form.register("headline")} 
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Your compelling headline"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subheadline" className="text-sm font-medium text-slate-700">Subheadline</Label>
                  <Input 
                    id="subheadline" 
                    {...form.register("subheadline")} 
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Supporting text"
                  />
                </div>
              </div>
            </div>

            {/* Mission & Story */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Mission & Story</h3>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mission" className="text-sm font-medium text-slate-700">Mission</Label>
                  <Textarea 
                    id="mission" 
                    rows={5} 
                    {...form.register("mission")} 
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    placeholder="What drives your company..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="story" className="text-sm font-medium text-slate-700">Story</Label>
                  <Textarea 
                    id="story" 
                    rows={5} 
                    {...form.register("story")} 
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    placeholder="Your origin story..."
                  />
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Link2 className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Company Details</h3>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="headquarters" className="text-sm font-medium text-slate-700">Headquarters</Label>
                  <Input 
                    id="headquarters" 
                    {...form.register("headquarters")} 
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sizeRange" className="text-sm font-medium text-slate-700">Team Size</Label>
                  <Input 
                    id="sizeRange" 
                    {...form.register("sizeRange")} 
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., 50-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-medium text-slate-700">Website</Label>
                  <Input 
                    id="website" 
                    {...form.register("website")} 
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Media Assets */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Image className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Media Assets</h3>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="theme.logoUrl" className="text-sm font-medium text-slate-700">Logo URL</Label>
                  <Input 
                    id="theme.logoUrl" 
                    {...form.register("theme.logoUrl")} 
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme.bannerImageUrl" className="text-sm font-medium text-slate-700">Banner Image URL</Label>
                  <Input
                    id="theme.bannerImageUrl"
                    {...form.register("theme.bannerImageUrl")}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme.cultureVideoUrl" className="text-sm font-medium text-slate-700">Culture Video URL</Label>
                <Input
                  id="theme.cultureVideoUrl"
                  {...form.register("theme.cultureVideoUrl")}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://www.youtube.com/embed/VIDEO_ID"
                />
              </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Color Palette</h3>
              </div>
              <div className="grid gap-5 md:grid-cols-4">
                <ColorInput
                  id="theme.primaryColor"
                  label="Primary"
                  register={form.register("theme.primaryColor")}
                />
                <ColorInput
                  id="theme.secondaryColor"
                  label="Secondary"
                  register={form.register("theme.secondaryColor")}
                />
                <ColorInput
                  id="theme.accentColor"
                  label="Accent"
                  register={form.register("theme.accentColor")}
                />
                <ColorInput
                  id="theme.backgroundColor"
                  label="Background"
                  register={form.register("theme.backgroundColor")}
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Content Sections */}
      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Content Sections</CardTitle>
                <CardDescription>Add custom sections to your career page</CardDescription>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Plus className="h-4 w-4" />
                  Add Section
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">Create New Section</DialogTitle>
                </DialogHeader>
                <div className="space-y-5 pt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Title</Label>
                    <Input
                      value={newSection.title}
                      onChange={(e) =>
                        setNewSection((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                      placeholder="e.g., About Us, Our Culture, Benefits"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Summary (optional)</Label>
                    <Input
                      value={newSection.summary}
                      onChange={(e) =>
                        setNewSection((prev) => ({
                          ...prev,
                          summary: e.target.value,
                        }))
                      }
                      className="border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                      placeholder="A brief description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Content</Label>
                    <Textarea
                      rows={6}
                      value={newSection.content}
                      onChange={(e) =>
                        setNewSection((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      className="border-slate-300 focus:border-purple-500 focus:ring-purple-500 resize-none"
                      placeholder="Enter your section content..."
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button 
                      onClick={addSection} 
                      disabled={!newSection.title || !newSection.content}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Create Section
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
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {orderedSections.map((section, idx) => (
              <article
                key={section.id}
                className="group relative rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:shadow-md hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        {section.title}
                      </span>
                      {section.id.startsWith('temp-') && (
                        <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700">
                          ✨ New (unsaved)
                        </span>
                      )}
                    </div>
                    {section.summary && (
                      <p className="text-sm font-semibold text-slate-900 leading-relaxed">{section.summary}</p>
                    )}
                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed line-clamp-3">
                      {section.content}
                    </p>
                  </div>
                  <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveSection(idx, "up")}
                      disabled={idx === 0}
                      className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveSection(idx, "down")}
                      disabled={idx === orderedSections.length - 1}
                      className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteSection(section.id)}
                      className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
            {orderedSections.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-slate-100 p-4 mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-900 mb-1">No sections yet</p>
                <p className="text-sm text-slate-500">Click &quot;Add Section&quot; to create your first content section</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Reminder */}
      <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-amber-100">
            <Sparkles className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-900 mb-1">Remember to save your changes</h3>
            <p className="text-sm text-amber-800">
              Changes are only visible in preview until you click the &quot;Save Changes&quot; button at the top of the page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorInput({
  id,
  label,
  register,
}: {
  id: string;
  label: string;
  register: UseFormRegisterReturn;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</Label>
      <div className="relative group">
        <Input 
          id={id} 
          type="color" 
          className="h-16 w-full cursor-pointer rounded-lg border-2 border-slate-300 transition-all hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
          {...register} 
        />
        <div className="absolute inset-0 rounded-lg ring-2 ring-transparent group-hover:ring-slate-200 transition-all pointer-events-none"></div>
      </div>
    </div>
  );
}

