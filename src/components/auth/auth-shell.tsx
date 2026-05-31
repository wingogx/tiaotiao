import Link from 'next/link';
import type { ReactNode } from 'react';
import { BarChart3, X } from 'lucide-react';

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  brand?: string;
};

export function AuthShell({ title, description, children, brand = 'Tiaotiao' }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_50%_-10%,rgba(34,211,238,0.18),transparent_34%),linear-gradient(180deg,#05070c_0%,#0b1019_48%,#101722_100%)] px-4 py-8 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-14rem] top-[18%] h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-[150px]" />
        <div className="absolute bottom-[-12rem] right-[-10rem] h-[32rem] w-[32rem] rounded-full bg-blue-600/10 blur-[160px]" />
        <div className="absolute left-[10%] top-[14%] h-1 w-1 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
        <div className="absolute right-[22%] top-[21%] h-1.5 w-1.5 rounded-full bg-cyan-300/80 shadow-[0_0_16px_rgba(34,211,238,0.8)]" />
        <div className="absolute bottom-[20%] left-[18%] h-1 w-1 rounded-full bg-cyan-300/70 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
      </div>

      <section className="relative mx-auto w-full max-w-[504px] rounded-[2rem] border border-cyan-400/20 bg-[#171b24]/92 px-8 pb-8 pt-9 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_28px_90px_rgba(0,0,0,0.45),0_0_70px_rgba(34,211,238,0.10)] backdrop-blur-2xl sm:px-10">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

        <Link
          aria-label="返回首页"
          className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-slate-400 transition hover:bg-cyan-400/20 hover:text-white"
          href="/"
        >
          <X className="h-5 w-5" />
        </Link>

        <div className="flex justify-center">
          <div className="flex h-[104px] w-[104px] items-center justify-center rounded-full border-2 border-cyan-400/55 bg-[radial-gradient(circle_at_35%_24%,rgba(34,211,238,0.46),rgba(15,23,42,0.92)_58%)] shadow-[0_0_34px_rgba(34,211,238,0.30)]">
            <BarChart3 className="h-11 w-11 text-cyan-100 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.35em] text-cyan-300/75">{brand}</p>
          <h1 className="mt-3 text-[2rem] font-bold tracking-[0.08em] text-cyan-300">{title}</h1>
          <p className="mt-3 text-sm font-medium leading-7 text-slate-400">{description}</p>
        </div>

        {children}
      </section>
    </div>
  );
}
