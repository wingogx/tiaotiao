import { createServiceRoleClient } from '@/lib/supabase/service';

const homePageKey = 'home';

export async function getHomeVisitCount() {
  const service = createServiceRoleClient();
  const { count, error } = await service.from('page_visits').select('id', { count: 'exact', head: true }).eq('page_key', homePageKey);

  if (error) {
    throw new Error(`Failed to load home visit count: ${error.message}`);
  }

  return count ?? 0;
}

export async function trackHomeVisit() {
  const service = createServiceRoleClient();
  const { error: insertError } = await service.from('page_visits').insert({ page_key: homePageKey });

  if (insertError) {
    throw new Error(`Failed to track home visit: ${insertError.message}`);
  }

  return getHomeVisitCount();
}
