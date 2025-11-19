"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const nextUrl = search.get("next");
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      passcode: "",
    },
  });

  const onSubmit = (values: LoginInput) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Unable to log in");
        }
        toast.success("Welcome back!", {
          description: `Loaded ${data.company.name}`,
        });
        router.replace(nextUrl ?? `/${data.company.slug}/edit`);
        router.refresh();
      } catch (error) {
        toast.error("Login failed", {
          description:
            error instanceof Error ? error.message : "Please try again",
        });
      }
    });
  };

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit(onSubmit)}
      data-testid="login-form"
    >
      <div className="space-y-2">
        <Label htmlFor="email">Recruiter email</Label>
        <Input
          id="email"
          placeholder="you@company.com"
          type="email"
          autoComplete="email"
          {...form.register("email")}
          disabled={isPending}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-600">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="passcode">Passcode</Label>
        <Input
          id="passcode"
          type="password"
          placeholder="••••••"
          autoComplete="current-password"
          {...form.register("passcode")}
          disabled={isPending}
        />
        {form.formState.errors.passcode && (
          <p className="text-sm text-red-600">
            {form.formState.errors.passcode.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-12"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}

