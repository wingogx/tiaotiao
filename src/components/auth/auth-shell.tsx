import Link from 'next/link';
import type { ReactNode } from 'react';
import { HeartHandshake, X } from 'lucide-react';

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  brand?: string;
};

export function AuthShell({ title, description, children, brand = 'LUMIA 记录室' }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 text-[var(--neko-ink)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(255,222,185,0.82),transparent_30%),radial-gradient(circle_at_86%_10%,rgba(211,152,143,0.24),transparent_24%),linear-gradient(180deg,#fff8f2_0%,#f7efe9_52%,#f1e5dd_100%)]" />
        <div className="absolute left-[-10rem] top-[18%] h-[24rem] w-[24rem] rounded-full bg-[#f5d1a8]/28 blur-[90px]" />
        <div className="absolute bottom-[-8rem] right-[-8rem] h-[20rem] w-[20rem] rounded-full bg-[#d98f98]/18 blur-[88px]" />
      </div>

      <section className="relative mx-auto w-full max-w-[560px] rounded-[34px] border border-[var(--neko-line)] bg-white/78 px-5 pb-6 pt-6 shadow-[0_24px_70px_rgba(93,65,57,0.12)] backdrop-blur-2xl sm:px-7 sm:pb-7 sm:pt-7">
        <Link
          aria-label="返回首页"
          className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--neko-line)] bg-white/74 text-[var(--neko-muted)] shadow-sm transition hover:bg-white hover:text-[var(--neko-ink)]"
          href="/"
        >
          <X className="h-5 w-5" />
        </Link>

        <div className="flex justify-center">
          <div className="legacy-gradient flex h-[104px] w-[104px] items-center justify-center rounded-full border border-white/40 text-white shadow-[0_22px_50px_rgba(201,101,113,0.28)]">
            <HeartHandshake className="h-11 w-11" />
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[12px] font-bold uppercase tracking-[0.35em] text-[var(--neko-muted)]">{brand}</p>
          <h1 className="mt-3 text-[2.15rem] font-black tracking-[0.04em] text-[var(--neko-ink)]">{title}</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--neko-muted)]">{description}</p>
        </div>

        {children}
      </section>
    </div>
  );
}
