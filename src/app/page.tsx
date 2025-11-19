import Link from "next/link";
import { ArrowRight, Palette, Sparkles, TabletSmartphone } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const features = [
  {
    title: "Brand-grade theming",
    description:
      "Recruiters control colors, hero media, and culture stories without touching code.",
    icon: Palette,
  },
  {
    title: "Safe, structured edits",
    description:
      "Sections, jobs, and preview mode keep draft work separate until it’s ready.",
    icon: Sparkles,
  },
  {
    title: "Mobile-first candidate UX",
    description:
      "SEO-ready pages load fast and include filters so candidates can find roles quickly.",
    icon: TabletSmartphone,
  },
];

export default async function Home() {
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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-24 sm:pt-32 lg:gap-20 lg:px-10">
      <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-100/70 px-4 py-1 text-sm font-medium text-emerald-800">
            <Sparkles size={16} />
            Recruiter + candidate friendly
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Build careers pages that stay on-brand and convert curious candidates
            into applicants.
          </h1>
          <p className="text-lg text-slate-600">
            A modern, multi-tenant ATS platform with powerful recruiter tools
            and beautiful candidate-facing career pages. Built for scale with
            Next.js, Prisma, and PostgreSQL.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-white transition hover:bg-slate-800"
            >
              Enter recruiter console
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-slate-800 transition hover:bg-slate-50"
            >
              Create a workspace
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-xl shadow-emerald-100">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Why it matters
            </p>
            <ul className="space-y-6">
              {features.map((feature) => (
                <li
                  key={feature.title}
                  className="flex gap-4 rounded-2xl border border-emerald-100/70 bg-emerald-50/70 p-4"
                >
                  <feature.icon className="text-emerald-600" />
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      </main>
  );
}
