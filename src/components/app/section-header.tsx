import type { PropsWithChildren } from 'react';

export function SectionHeader({ title, description, children }: PropsWithChildren<{ title: string; description?: string }>) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 rounded-[24px] border border-[var(--border)] bg-white/82 px-6 py-5 shadow-[0_12px_34px_rgba(37,48,68,0.06)]">
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Admin Section</div>
        <h1 className="serif-heading mt-2 text-3xl leading-tight text-[var(--foreground)] md:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}
