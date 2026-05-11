import type { PropsWithChildren } from 'react';

export function SectionHeader({ title, description, children }: PropsWithChildren<{ title: string; description?: string }>) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4 rounded-[24px] border border-[var(--border)] bg-white/72 px-5 py-4 shadow-sm">
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">Admin Section</div>
        <h1 className="serif-heading mt-2 text-3xl text-[var(--foreground)]">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}
