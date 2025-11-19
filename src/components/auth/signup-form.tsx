"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signupSchema, type SignupInput } from "@/lib/validators/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function SignupForm() {
  const router = useRouter();
  const [generatedSlug, setGeneratedSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      companyName: "",
      slug: "",
      recruiterName: "",
      recruiterEmail: "",
      passcode: "",
      headline: "",
      subheadline: "",
    },
  });

  const handleCompanyChange = (value: string) => {
    form.setValue("companyName", value);
    const slug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setGeneratedSlug(slug);
    if (!slugManuallyEdited) {
      form.setValue("slug", slug);
    }
  };

  const onSubmit = (values: SignupInput) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Unable to create company");
        }

        toast.success("Workspace created", {
          description: `Sign in with ${data.recruiter.email} at /login`,
        });
        router.push("/login");
      } catch (error) {
        toast.error("Signup failed", {
          description:
            error instanceof Error ? error.message : "Please try again",
        });
      }
    });
  };

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit(onSubmit)}
      data-testid="signup-form"
    >
      <div className="space-y-2">
        <Label htmlFor="companyName">Company name</Label>
        <Input
          id="companyName"
          placeholder="Acme Rockets"
          {...form.register("companyName")}
          onChange={(event) => handleCompanyChange(event.target.value)}
          disabled={isPending}
        />
        {form.formState.errors.companyName && (
          <p className="text-sm text-red-600">
            {form.formState.errors.companyName.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          placeholder="acme"
          {...form.register("slug")}
          onChange={(e) => {
            form.setValue("slug", e.target.value);
            setSlugManuallyEdited(true);
          }}
          disabled={isPending}
        />
        <p className="text-xs text-slate-500">
          This becomes your public URL (e.g. /acme/careers). Suggested:{" "}
          <span className="font-semibold">{generatedSlug || "acme"}</span>
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="recruiterName">Your name</Label>
        <Input
          id="recruiterName"
          placeholder="Jordan Ellis"
          {...form.register("recruiterName")}
          disabled={isPending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="recruiterEmail">Work email</Label>
        <Input
          id="recruiterEmail"
          type="email"
          placeholder="you@company.com"
          {...form.register("recruiterEmail")}
          disabled={isPending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="passcode">Passcode</Label>
        <Input
          id="passcode"
          type="password"
          placeholder="At least 6 characters"
          {...form.register("passcode")}
          disabled={isPending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="headline">Headline</Label>
        <Textarea
          id="headline"
          rows={2}
          placeholder="Build climate hardware that matters."
          {...form.register("headline")}
          disabled={isPending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subheadline">Subheadline</Label>
        <Textarea
          id="subheadline"
          rows={3}
          placeholder="Share what candidates can expect when joining your company."
          {...form.register("subheadline")}
          disabled={isPending}
        />
      </div>
      <Button
        type="submit"
        className="w-full h-12"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
            Creating…
          </>
        ) : (
          "Create workspace"
        )}
      </Button>
    </form>
  );
}

