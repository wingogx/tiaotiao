import { subDays } from 'date-fns';

import { getCurrentSessionUser } from '@/lib/auth/session';
import { emptyUserHomeVitals, parseSiteHomeState, parseUserHomeVitals } from '@/lib/home/state';
import { getHomeVisitCount } from '@/lib/home/visits';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { clampPercent, excerptFromMarkdown, formatDate, getCurrentDayIndex, getShanghaiDateString, slugify } from '@/lib/utils/format';

export type SiteSettings = {
  id: number;
  site_title: string;
  site_subtitle: string;
  start_date: string;
  total_days: number;
  total_target: number;
};

export type Project = {
  id: string;
  name: string;
  status: 'active' | 'closed';
  notes: string | null;
  created_at: string;
};

export type IncomeRecord = {
  id: string;
  project_id: string;
  amount: number;
  income_type: IncomeType;
  note: string | null;
  record_date: string;
  created_at: string;
  projects?: Pick<Project, 'name'> | null;
};

export type DailyTask = {
  id: string;
  task_date: string;
  title: string;
  source_type: 'fixed' | 'project_daily' | 'project_once' | 'temporary';
  status: 'pending' | 'completed';
  sort_order: number;
  is_temporary: boolean;
  project_id: string | null;
  template_id: string | null;
  projects?: Pick<Project, 'name'> | null;
};

export type TaskTemplate = {
  id: string;
  title: string;
  source_type: 'fixed' | 'project_daily' | 'project_once';
  start_date: string | null;
  end_date: string | null;
  scheduled_date: string | null;
  is_active: boolean;
  project_id: string | null;
  projects?: Pick<Project, 'name'> | null;
};

export type DailyPost = {
  id: string;
  title: string;
  slug: string;
  post_type: PostType;
  cover_url: string | null;
  excerpt: string;
  content_md: string;
  post_date: string;
  created_at: string;
};

export type IncomeType = 'content' | 'product' | 'securities' | 'other';

export type PostType = 'business_review' | 'product_review' | 'content_review' | 'life_insight' | 'daily_note';

export type PostComment = {
  id: string;
  post_id: string;
  body: string;
  created_at: string;
  profiles?: Pick<ProfileSummary, 'display_name' | 'email'> | null;
};

export type ViewerReactionKey = 'watch' | 'favorite' | 'cheer';

export type ViewerReactionStats = Record<ViewerReactionKey, number> & {
  total: number;
};

type ProfileSummary = {
  display_name: string | null;
  email: string;
};

export const incomeTypeValues = ['content', 'product', 'securities', 'other'] as const;
export const postTypeValues = ['business_review', 'product_review', 'content_review', 'life_insight', 'daily_note'] as const;

export const incomeTypeOptions = [
  { value: 'content', label: '内容收入' },
  { value: 'product', label: '产品收入' },
  { value: 'securities', label: '证券投资' },
  { value: 'other', label: '其他收入' },
] as const satisfies Array<{ value: (typeof incomeTypeValues)[number]; label: string }>;

export const postTypeOptions = [
  { value: 'business_review', label: '经营复盘' },
  { value: 'product_review', label: '产品复盘' },
  { value: 'content_review', label: '内容复盘' },
  { value: 'life_insight', label: '人生领悟' },
  { value: 'daily_note', label: '日常记录' },
] as const satisfies Array<{ value: (typeof postTypeValues)[number]; label: string }>;

export function normalizeIncomeType(value: string | null | undefined): IncomeType {
  return incomeTypeOptions.find((item) => item.value === value)?.value ?? 'content';
}

export function normalizePostType(value: string | null | undefined): PostType {
  return postTypeOptions.find((item) => item.value === value)?.value ?? 'business_review';
}

export function getIncomeTypeLabel(value: string | null | undefined) {
  return incomeTypeOptions.find((item) => item.value === value)?.label ?? '内容收入';
}

export function getPostTypeLabel(value: string | null | undefined) {
  return postTypeOptions.find((item) => item.value === value)?.label ?? '经营复盘';
}

function getTodayString() {
  return getShanghaiDateString();
}

export async function ensureDailyTasks(taskDate = getTodayString()) {
  const service = createServiceRoleClient();
  const { error } = await service.rpc('generate_daily_tasks', { target_date: taskDate });

  if (error) {
    throw new Error(`Failed to ensure daily tasks: ${error.message}`);
  }
}

export async function getSiteSettings() {
  const service = createServiceRoleClient();
  const { data, error } = await service.from('site_settings').select('*').eq('id', 1).single<SiteSettings>();

  if (error || !data) {
    throw new Error(`Failed to load site settings: ${error?.message ?? 'missing data'}`);
  }

  return data;
}

export async function getProjects() {
  const service = createServiceRoleClient();
  const { data, error } = await service.from('projects').select('*').order('created_at', { ascending: false }).returns<Project[]>();

  if (error) {
    throw new Error(`Failed to load projects: ${error.message}`);
  }

  return data ?? [];
}

export async function getIncomeRecords() {
  const service = createServiceRoleClient();
  const { data, error } = await service
    .from('income_records')
    .select('id, project_id, amount, income_type, note, record_date, created_at, projects(name)')
    .order('created_at', { ascending: false })
    .returns<IncomeRecord[]>();

  if (error) {
    throw new Error(`Failed to load income records: ${error.message}`);
  }

  return data ?? [];
}

export async function getTaskTemplates() {
  const service = createServiceRoleClient();
  const { data, error } = await service
    .from('task_templates')
    .select('id, title, source_type, start_date, end_date, scheduled_date, is_active, project_id, projects(name)')
    .order('created_at', { ascending: false })
    .returns<TaskTemplate[]>();

  if (error) {
    throw new Error(`Failed to load task templates: ${error.message}`);
  }

  return data ?? [];
}

export async function getDailyTasks(taskDate = getTodayString()) {
  await ensureDailyTasks(taskDate);

  const service = createServiceRoleClient();
  const { data, error } = await service
    .from('daily_tasks')
    .select('id, task_date, title, source_type, status, sort_order, is_temporary, project_id, template_id, projects(name)')
    .eq('task_date', taskDate)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
    .returns<DailyTask[]>();

  if (error) {
    throw new Error(`Failed to load daily tasks: ${error.message}`);
  }

  return data ?? [];
}

export async function getPosts(limit?: number) {
  const service = createServiceRoleClient();
  let query = service
    .from('daily_posts')
    .select('id, title, slug, post_type, cover_url, excerpt, content_md, post_date, created_at')
    .eq('is_published', true)
    .order('post_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query.returns<DailyPost[]>();

  if (error) {
    throw new Error(`Failed to load posts: ${error.message}`);
  }

  return data ?? [];
}

export async function getPostBySlug(slug: string) {
  const service = createServiceRoleClient();
  const { data, error } = await service
    .from('daily_posts')
    .select('id, title, slug, post_type, cover_url, excerpt, content_md, post_date, created_at')
    .eq('slug', slug)
    .single<DailyPost>();

  if (error) {
    return null;
  }

  return data;
}

export async function getPostComments(postId: string) {
  const service = createServiceRoleClient();
  const { data, error } = await service
    .from('post_comments')
    .select('id, post_id, body, created_at, profiles(display_name, email)')
    .eq('post_id', postId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .returns<PostComment[]>();

  if (error) {
    throw new Error(`Failed to load post comments: ${error.message}`);
  }

  return data ?? [];
}

export async function getViewerReactionCount(reactionKey = 'watch') {
  const service = createServiceRoleClient();
  const { count, error } = await service.from('viewer_reactions').select('id', { count: 'exact', head: true }).eq('reaction_key', reactionKey);

  if (error) {
    throw new Error(`Failed to load viewer reaction count: ${error.message}`);
  }

  return count ?? 0;
}

export async function getViewerReactionStats(): Promise<ViewerReactionStats> {
  const [watch, favorite, cheer] = await Promise.all([
    getViewerReactionCount('watch'),
    getViewerReactionCount('favorite'),
    getViewerReactionCount('cheer'),
  ]);

  return {
    watch,
    favorite,
    cheer,
    total: watch + favorite + cheer,
  };
}

export async function getProfiles() {
  const service = createServiceRoleClient();
  const { data, error } = await service
    .from('profiles')
    .select('id, email, role, can_view_articles, display_name, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load profiles: ${error.message}`);
  }

  return data ?? [];
}

export async function getDashboardData() {
  const [settings, projects, incomeRecords, posts, currentUser, visitCount, reactionStats] = await Promise.all([
    getSiteSettings(),
    getProjects(),
    getIncomeRecords(),
    getPosts(5),
    getCurrentSessionUser(),
    getHomeVisitCount(),
    getViewerReactionStats(),
  ]);

  const today = new Date();
  const todayString = getTodayString();
  const homeState = parseSiteHomeState(settings.site_subtitle);
  const currentDay = getCurrentDayIndex(settings.start_date);
  const totalRevenue = incomeRecords.reduce((sum, item) => sum + Number(item.amount), 0);
  const todayRevenue = incomeRecords
    .filter((item) => item.record_date === todayString)
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const activeProjects = projects.filter((item) => item.status === 'active').length;
  const timeProgress = clampPercent((currentDay / settings.total_days) * 100);
  const incomeProgress = clampPercent((totalRevenue / Number(settings.total_target)) * 100);
  const gapToGoal = Number(settings.total_target) - totalRevenue;

  const revenueMap = new Map<string, number>();
  incomeRecords.forEach((record) => {
    const current = revenueMap.get(record.record_date) ?? 0;
    revenueMap.set(record.record_date, current + Number(record.amount));
  });

  const recentRevenue = Array.from({ length: 14 }).map((_, index) => {
    const date = subDays(today, 13 - index);
    const key = formatDate(date);
    return {
      date: key.slice(5),
      amount: revenueMap.get(key) ?? 0,
    };
  });

  const projectTotals = projects.map((project) => {
    const total = incomeRecords
      .filter((item) => item.project_id === project.id)
      .reduce((sum, item) => sum + Number(item.amount), 0);

    return {
      ...project,
      total,
    };
  });

  let viewer: { id: string; email: string; displayName: string | null } | null = null;
  let viewerVitals = null;

  if (currentUser?.id) {
    const service = createServiceRoleClient();
    const { data, error } = await service.auth.admin.getUserById(currentUser.id);
    const authUser = data.user;

    viewer = {
      id: currentUser.id,
      email: currentUser.email ?? '',
      displayName:
        authUser?.user_metadata?.display_name && typeof authUser.user_metadata.display_name === 'string'
          ? authUser.user_metadata.display_name
          : currentUser.user_metadata?.display_name ?? null,
    };

    viewerVitals = error
      ? emptyUserHomeVitals(todayString)
      : parseUserHomeVitals(authUser?.user_metadata?.home_vitals, todayString);
  }

  return {
    settings,
    posts,
    homeStatus: {
      mood: homeState.homeMood,
      tagline: homeState.tagline,
      todayString,
      visitCount,
      reactionCount: reactionStats.total,
      reactionStats,
    },
    viewer,
    viewerVitals,
    summary: {
      currentDay,
      totalRevenue,
      todayRevenue,
      activeProjects,
      timeProgress,
      incomeProgress,
      gapToGoal,
    },
    recentRevenue,
    projectTotals,
  };
}

export async function getTodayConsoleData() {
  const [settings, projects, incomeRecords, tasks, posts] = await Promise.all([
    getSiteSettings(),
    getProjects(),
    getIncomeRecords(),
    getDailyTasks(),
    getPosts(1),
  ]);

  const todayString = getTodayString();
  const homeState = parseSiteHomeState(settings.site_subtitle);
  const todayIncomeRecords = incomeRecords.filter((item) => item.record_date === todayString);
  const todayRevenue = todayIncomeRecords.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalRevenue = incomeRecords.reduce((sum, item) => sum + Number(item.amount), 0);
  const completedTasks = tasks.filter((item) => item.status === 'completed').length;
  const pendingTasks = tasks.length - completedTasks;

  return {
    settings,
    homeStatus: {
      mood: homeState.homeMood,
      tagline: homeState.tagline,
      todayString,
    },
    projects,
    tasks,
    posts,
    incomeRecords,
    todayIncomeRecords,
    summary: {
      todayString,
      currentDay: getCurrentDayIndex(settings.start_date),
      todayRevenue,
      totalRevenue,
      completedTasks,
      pendingTasks,
      totalTasks: tasks.length,
      taskCompletionRate: tasks.length > 0 ? clampPercent((completedTasks / tasks.length) * 100) : 0,
    },
  };
}

export async function getProgressData() {
  const [settings, incomeRecords, tasks] = await Promise.all([
    getSiteSettings(),
    getIncomeRecords(),
    getDailyTasks(),
  ]);

  const totalRevenue = incomeRecords.reduce((sum, item) => sum + Number(item.amount), 0);
  const currentDay = getCurrentDayIndex(settings.start_date);
  const completedTasks = tasks.filter((item) => item.status === 'completed').length;
  const totalTasks = tasks.length;
  const revenueByDate = new Map<string, number>();
  incomeRecords.forEach((record) => {
    revenueByDate.set(record.record_date, (revenueByDate.get(record.record_date) ?? 0) + Number(record.amount));
  });

  let runningRevenue = 0;
  const revenueCurve = Array.from(revenueByDate.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, amount]) => {
      runningRevenue += amount;
      return {
        date,
        amount,
        total: runningRevenue,
      };
    });

  return {
    currentDay,
    remainingDays: Math.max(settings.total_days - currentDay, 0),
    totalRevenue,
    timeProgress: clampPercent((currentDay / settings.total_days) * 100),
    incomeProgress: clampPercent((totalRevenue / Number(settings.total_target)) * 100),
    gapToGoal: Number(settings.total_target) - totalRevenue,
    taskCompletionRate: totalTasks > 0 ? clampPercent((completedTasks / totalTasks) * 100) : 0,
    completedTasks,
    pendingTasks: totalTasks - completedTasks,
    revenueCurve,
  };
}

export function buildPostPayload({
  title,
  coverUrl,
  content,
  excerpt,
  postType,
}: {
  title: string;
  coverUrl?: string;
  content: string;
  excerpt?: string;
  postType?: string;
}) {
  const slugBase = slugify(title);
  const slug = `${getShanghaiDateString()}-${slugBase}`;

  return {
    title,
    slug,
    post_type: normalizePostType(postType),
    cover_url: coverUrl?.trim() || null,
    excerpt: excerpt?.trim() || excerptFromMarkdown(content),
    content_md: content,
    post_date: getShanghaiDateString(),
  };
}
