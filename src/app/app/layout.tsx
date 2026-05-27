import type { PropsWithChildren } from 'react';

import { requireAdmin } from '@/lib/auth/session';

import { MobileAppShell } from '@/components/mobile/mobile-app-shell';

export default async function AppLayout({ children }: PropsWithChildren) {
  const profile = await requireAdmin();
  const accountLabel = profile.display_name ?? profile.email;

  return (
    <MobileAppShell accountLabel={accountLabel}>
      <div className="space-y-5">{children}</div>
    </MobileAppShell>
  );
}
