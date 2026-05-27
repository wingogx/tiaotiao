import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'h-12 w-full rounded-[20px] border border-[var(--neko-line)] bg-white/78 px-4 text-sm text-[var(--neko-ink)] shadow-sm outline-none transition placeholder:text-[var(--neko-muted)] focus:border-[var(--neko-red)] focus:bg-white',
        props.className,
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'min-h-32 w-full rounded-[24px] border border-[var(--neko-line)] bg-white/78 px-4 py-3 text-sm text-[var(--neko-ink)] shadow-sm outline-none transition placeholder:text-[var(--neko-muted)] focus:border-[var(--neko-red)] focus:bg-white',
        props.className,
      )}
    />
  );
}
