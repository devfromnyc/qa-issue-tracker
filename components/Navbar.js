"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href={session ? "/boards" : "/"} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            QA
          </span>
          <span className="font-semibold text-slate-100">Release Tracker</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {session ? (
            <>
              <Link
                href="/boards"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Directory
              </Link>
              <Link
                href="/search"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Search
              </Link>
              <span className="text-slate-500">
                {session.user.name}
                {session.user.isGuest && (
                  <span className="ml-1 rounded bg-amber-900/50 px-1.5 py-0.5 text-xs text-amber-200">
                    Guest
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-500 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
