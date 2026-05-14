import type { PropsWithChildren } from 'react';

import { requireAdmin } from '@/lib/auth/session';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { SiteHeader } from '@/components/layout/site-header';

export default async function AppLayout({ children }: PropsWithChildren) {
  await requireAdmin();

  return (
    <div className="min-h-screen pb-12">
      <SiteHeader />
      <main className="page-shell grid gap-5 py-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6 lg:py-8">
        <AppSidebar />
        <div className="min-w-0 space-y-6">{children}</div>
      </main>
    </div>
  );
}
