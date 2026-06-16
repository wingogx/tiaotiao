import type { PropsWithChildren } from 'react';

import { cn } from '@/lib/utils/cn';

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('rounded-[28px] p-6', className)}>{children}</div>;
}
