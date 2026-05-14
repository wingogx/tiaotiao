import { subDays } from 'date-fns';

import { createServiceRoleClient } from '@/lib/supabase/service';
import { clampPercent, excerptFromMarkdown, formatDate, getCurrentDayIndex, slugify } from '@/lib/utils/format';

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
  cover_url: string | null;
  excerpt: string;
  content_md: string;
  post_date: string;
  created_at: string;
};

function getTodayString() {
  return formatDate(new Date());
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
    .select('id, project_id, amount, note, record_date, created_at, projects(name)')
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
    .select('id, title, slug, cover_url, excerpt, content_md, post_date, created_at')
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
    .select('id, title, slug, cover_url, excerpt, content_md, post_date, created_at')
    .eq('slug', slug)
    .single<DailyPost>();

  if (error) {
    return null;
  }

  return data;
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
  const [settings, projects, incomeRecords, posts] = await Promise.all([
    getSiteSettings(),
    getProjects(),
    getIncomeRecords(),
    getPosts(5),
  ]);

  const today = new Date();
  const todayString = getTodayString();
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

  return {
    settings,
    posts,
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
  const todayIncomeRecords = incomeRecords.filter((item) => item.record_date === todayString);
  const todayRevenue = todayIncomeRecords.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalRevenue = incomeRecords.reduce((sum, item) => sum + Number(item.amount), 0);
  const completedTasks = tasks.filter((item) => item.status === 'completed').length;
  const pendingTasks = tasks.length - completedTasks;

  return {
    settings,
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
}: {
  title: string;
  coverUrl?: string;
  content: string;
  excerpt?: string;
}) {
  const slugBase = slugify(title);
  const slug = `${formatDate(new Date())}-${slugBase}`;

  return {
    title,
    slug,
    cover_url: coverUrl?.trim() || null,
    excerpt: excerpt?.trim() || excerptFromMarkdown(content),
    content_md: content,
    post_date: formatDate(new Date()),
  };
}
