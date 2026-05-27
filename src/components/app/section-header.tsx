import type { PropsWithChildren } from 'react';

export function SectionHeader({ title, description, children }: PropsWithChildren<{ title: string; description?: string }>) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 rounded-[28px] border border-[var(--neko-line)] bg-white/78 px-5 py-5 shadow-[0_14px_34px_rgba(93,65,57,0.08)] backdrop-blur-xl">
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--neko-red)]">Challenge Module</div>
        <h1 className="mt-2 text-3xl font-black leading-tight text-[var(--neko-ink)]">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}
