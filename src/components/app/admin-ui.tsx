import type { LabelHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

import { Card } from '@/components/ui/card';

export function AdminPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <Card className={cn('rounded-[30px] border-[var(--neko-line)] bg-white/78 p-5 shadow-[0_14px_38px_rgba(93,65,57,0.08)] backdrop-blur-xl', className)}>{children}</Card>;
}

export function PanelHeading({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-lg font-black text-[var(--neko-ink)]">
          {icon ? <span className="text-[var(--accent)]">{icon}</span> : null}
          {title}
        </div>
        {description ? <div className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--muted)]">{description}</div> : null}
      </div>
      {action}
    </div>
  );
}

export function Field({ label, hint, children, className }: LabelHTMLAttributes<HTMLLabelElement> & { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className={cn('grid gap-2 text-xs font-bold text-[var(--neko-brown)]', className)}>
      <span>{label}</span>
      {children}
      {hint ? <span className="text-[11px] font-normal leading-5 text-[var(--muted)]/78">{hint}</span> : null}
    </label>
  );
}

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'active' | 'danger' | 'success' }) {
  const tones = {
    neutral: 'bg-[#f4ece7] text-[var(--neko-brown)]',
    active: 'bg-[#f7dfe4] text-[var(--neko-red)]',
    danger: 'bg-red-50 text-[var(--danger)]',
    success: 'bg-emerald-50 text-[var(--success)]',
  };

  return <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', tones[tone])}>{children}</span>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-[22px] border border-dashed border-[var(--neko-line)] bg-white/55 px-4 py-6 text-sm leading-7 text-[var(--neko-muted)]">{children}</div>;
}

export const selectClassName = 'h-12 w-full rounded-[20px] border border-[var(--neko-line)] bg-white/78 px-4 text-sm text-[var(--neko-ink)] shadow-sm outline-none transition focus:border-[var(--neko-red)] focus:bg-white';
