import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth/login-form";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    const company = await prisma.company.findUnique({
      where: { id: session.companyId },
      select: { slug: true },
    });
    if (company) {
      redirect(`/${company.slug}/edit`);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-center">
      <section className="flex flex-1 flex-col gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
          Recruiter Console
        </p>
        <h1 className="text-4xl font-semibold text-slate-900">
          Log in to customize your careers page.
        </h1>
        <p className="text-base text-slate-600">
          Sign in with your recruiter email and passcode to access the editor
          and customize your company's careers page.
        </p>
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm text-slate-600">
          <p>Don't have an account?</p>
          <Link
            href="/signup"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Create your recruiter workspace →
          </Link>
        </div>
      </section>
      <section className="flex flex-1 flex-col rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl shadow-emerald-100">
        <LoginForm />
      </section>
    </main>
  );
}

