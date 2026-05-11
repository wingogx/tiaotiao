import type { PropsWithChildren } from 'react';

import { requireAdmin } from '@/lib/auth/session';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { SiteHeader } from '@/components/layout/site-header';

export default async function AppLayout({ children }: PropsWithChildren) {
  await requireAdmin();

  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="page-shell grid gap-6 py-8 lg:grid-cols-[260px_1fr]">
        <AppSidebar />
        <div>{children}</div>
      </main>
    </div>
  );
}
