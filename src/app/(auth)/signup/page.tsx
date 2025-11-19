import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-center">
      <section className="flex flex-1 flex-col gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Create a Workspace
        </p>
        <h1 className="text-4xl font-semibold text-slate-900">
          Launch a careers site for your company in minutes.
        </h1>
        <p className="text-base text-slate-600">
          Share a few basics about your team. We&apos;ll create a workspace,
          seed default sections, and give you recruiter access so you can start
          editing right away.
        </p>
        <div className="rounded-2xl border border-indigo-100 bg-white p-4 text-sm text-slate-600">
          <p>Already have access?</p>
          <Link
            href="/login"
            className="font-semibold text-indigo-700 hover:text-indigo-800"
          >
            Sign in to your recruiter console →
          </Link>
        </div>
      </section>
      <section className="flex flex-1 flex-col rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl shadow-indigo-100">
        <SignupForm />
      </section>
    </main>
  );
}

