import { redirect } from 'next/navigation';

import { env } from '@/lib/supabase/env';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type AppRole = 'guest' | 'member' | 'admin';

export type Profile = {
  id: string;
  email: string;
  role: AppRole;
  can_view_articles: boolean;
  display_name: string | null;
};

export async function getCurrentSessionUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function syncProfile() {
  const user = await getCurrentSessionUser();

  if (!user?.email) {
    return null;
  }

  const service = createServiceRoleClient();
  const isAdminEmail = user.email.toLowerCase() === env.adminEmail.toLowerCase();

  const { data: existing } = await service
    .from('profiles')
    .select('id, email, role, can_view_articles, display_name')
    .eq('id', user.id)
    .maybeSingle<Profile>();

  const payload = {
    id: user.id,
    email: user.email,
    role: isAdminEmail ? 'admin' : existing?.role ?? 'guest',
    can_view_articles: isAdminEmail ? true : existing?.can_view_articles ?? false,
    display_name: existing?.display_name ?? null,
  } satisfies Profile;

  const { data, error } = await service
    .from('profiles')
    .upsert(payload)
    .select('id, email, role, can_view_articles, display_name')
    .single<Profile>();

  if (error) {
    throw new Error(`Failed to sync profile: ${error.message}`);
  }

  return data;
}

export async function requireAdmin() {
  const profile = await syncProfile();

  if (!profile) {
    redirect('/login?next=/app/today');
  }

  if (profile.role !== 'admin') {
    redirect('/articles');
  }

  return profile;
}

export async function getViewerAccess() {
  const profile = await syncProfile();

  return {
    profile,
    canViewArticles: profile?.role === 'admin' || profile?.can_view_articles === true,
    isAdmin: profile?.role === 'admin',
  };
}
