import { notFound } from "next/navigation";
import { requireCompanyEditor } from "@/lib/auth/guards";
import { getCompanyForEditor } from "@/lib/data/company";
import { EditorShell } from "@/components/editor/editor-shell";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ slug: string }>;
};

export default async function EditPage({ params }: Params) {
  const { slug } = await params;
  await requireCompanyEditor(slug);
  const company = await getCompanyForEditor(slug);

  if (!company) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col gap-8 bg-slate-50 px-4 py-10 md:px-8">
      <EditorShell company={company} />
    </main>
  );
}

