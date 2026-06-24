import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/boards");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-12 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-indigo-400">
          QA Release Management
        </p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Log issues without the spreadsheet chaos
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-400">
          Kanban boards for release QA — prioritize, filter, drag issues across
          statuses, and archive past projects for historical lookup.
        </p>
      </div>

      <div className="mb-12 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Kanban boards",
            desc: "Drag issues between To Do, In Progress, In Review, and Done.",
          },
          {
            title: "Historical records",
            desc: "Archive boards when a release ships and look them up later.",
          },
          {
            title: "Team directory",
            desc: "Browse all project boards and collaborate with the whole QA team.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
          >
            <h3 className="mb-2 font-semibold text-slate-100">{item.title}</h3>
            <p className="text-sm text-slate-400">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/demo"
          className="rounded-lg border border-indigo-500/60 bg-indigo-950/40 px-6 py-3 font-medium text-indigo-100 hover:bg-indigo-950/60 transition-colors"
        >
          Try interactive demo
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          Create account
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-slate-600 px-6 py-3 font-medium text-slate-200 hover:bg-slate-800 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
