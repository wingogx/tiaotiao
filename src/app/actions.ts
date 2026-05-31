'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/session';
import { buildPostPayload } from '@/lib/data/queries';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service';

const projectSchema = z.object({
  name: z.string().min(1, '项目名称不能为空'),
  notes: z.string().optional(),
});

const incomeSchema = z.object({
  projectId: z.string().uuid('项目必填'),
  amount: z.coerce.number(),
  note: z.string().optional(),
});

const taskTemplateSchema = z.object({
  title: z.string().min(1, '任务标题不能为空'),
  sourceType: z.enum(['fixed', 'project_daily', 'project_once']),
  projectId: z.string().uuid().optional().or(z.literal('')),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  scheduledDate: z.string().optional(),
});

const taskTemplateUpdateSchema = taskTemplateSchema.extend({
  id: z.string().uuid(),
});

const taskTemplateIdSchema = z.object({
  id: z.string().uuid(),
});

const taskToggleSchema = z.object({
  taskId: z.string().uuid(),
  nextStatus: z.enum(['pending', 'completed']),
});

const dailyTaskIdSchema = z.object({
  taskId: z.string().uuid(),
});

const tempTaskSchema = z.object({
  title: z.string().min(1, '任务标题不能为空'),
});

const postSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  coverUrl: z.string().url('封面需要是有效链接').optional().or(z.literal('')),
  excerpt: z.string().optional(),
  content: z.string().min(1, '正文不能为空'),
});

const userRoleSchema = z.object({
  profileId: z.string().uuid(),
  role: z.enum(['guest', 'member', 'admin']),
  canViewArticles: z.enum(['true', 'false']),
});

const registerSchema = z.object({
  displayName: z.string().min(1, '昵称不能为空'),
  email: z.string().email('请输入有效邮箱'),
  password: z.string().min(8, '密码至少 8 位'),
  agreed: z.literal('true', { error: '请先确认注册说明' }),
});

const adminCreateUserSchema = z.object({
  email: z.string().email('请输入有效邮箱'),
  password: z.string().min(8, '密码至少 8 位'),
  displayName: z.string().optional(),
  role: z.enum(['guest', 'member', 'admin']),
  canViewArticles: z.enum(['true', 'false']),
});

export async function signInWithMagicLink(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const next = String(formData.get('next') ?? '/articles');
  const service = createServiceRoleClient();

  const { error } = await service.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(`登录邮件发送失败：${error.message}`)}`);
  }

  redirect(`/login?sent=1&email=${encodeURIComponent(email)}`);
}

export async function registerUser(formData: FormData) {
  const parsed = registerSchema.safeParse({
    displayName: formData.get('displayName'),
    email: formData.get('email'),
    password: formData.get('password'),
    agreed: formData.get('agreed'),
  });

  if (!parsed.success) {
    redirect(`/register?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? '注册信息不正确')}`);
  }

  const service = createServiceRoleClient();
  const { data, error } = await service.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      display_name: parsed.data.displayName,
    },
  });

  if (error) {
    const message = error.message.includes('already') ? '这个邮箱已经注册过了' : error.message;
    redirect(`/register?error=${encodeURIComponent(message)}`);
  }

  const userId = data.user?.id;
  if (userId) {
    await service.from('profiles').upsert({
      id: userId,
      email: parsed.data.email,
      display_name: parsed.data.displayName,
      role: 'guest',
      can_view_articles: false,
    });
  }

  redirect(`/register?success=1&email=${encodeURIComponent(parsed.data.email)}`);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function createProject(formData: FormData) {
  await requireAdmin();
  const service = createServiceRoleClient();
  const parsed = projectSchema.parse({
    name: formData.get('name'),
    notes: formData.get('notes'),
  });

  const { error } = await service.from('projects').insert({
    name: parsed.name,
    notes: parsed.notes?.trim() || null,
  });

  if (error) {
    throw new Error(`创建项目失败：${error.message}`);
  }

  revalidatePath('/app/projects');
  revalidatePath('/');
}

export async function updateProject(formData: FormData) {
  await requireAdmin();
  const service = createServiceRoleClient();
  const id = String(formData.get('id'));
  const parsed = projectSchema.parse({
    name: formData.get('name'),
    notes: formData.get('notes'),
  });

  const { error } = await service.from('projects').update({ name: parsed.name, notes: parsed.notes?.trim() || null }).eq('id', id);

  if (error) {
    throw new Error(`更新项目失败：${error.message}`);
  }

  revalidatePath('/app/projects');
  revalidatePath('/');
}

export async function closeProject(formData: FormData) {
  await requireAdmin();
  const service = createServiceRoleClient();
  const id = String(formData.get('id'));
  const { error } = await service.from('projects').update({ status: 'closed' }).eq('id', id);

  if (error) {
    throw new Error(`关闭项目失败：${error.message}`);
  }

  revalidatePath('/app/projects');
  revalidatePath('/');
}

export async function deleteProject(formData: FormData) {
  await requireAdmin();
  const service = createServiceRoleClient();
  const id = String(formData.get('id'));

  const { count, error: countError } = await service
    .from('income_records')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', id);

  if (countError) {
    throw new Error(`检查项目收入失败：${countError.message}`);
  }

  if ((count ?? 0) > 0) {
    throw new Error('已有收入数据的项目不能删除');
  }

  const { error } = await service.from('projects').delete().eq('id', id);

  if (error) {
    throw new Error(`删除项目失败：${error.message}`);
  }

  revalidatePath('/app/projects');
}

export async function createIncomeRecord(formData: FormData) {
  const profile = await requireAdmin();
  const service = createServiceRoleClient();
  const parsed = incomeSchema.parse({
    projectId: formData.get('projectId'),
    amount: formData.get('amount'),
    note: formData.get('note'),
  });

  const { error } = await service.from('income_records').insert({
    project_id: parsed.projectId,
    amount: parsed.amount,
    note: parsed.note?.trim() || null,
    created_by: profile.id,
  });

  if (error) {
    throw new Error(`保存收入失败：${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/app/today');
  revalidatePath('/app/income');
  revalidatePath('/app/projects');
  revalidatePath('/app/progress');
}

export async function createTaskTemplate(formData: FormData) {
  await requireAdmin();
  const service = createServiceRoleClient();
  const parsed = taskTemplateSchema.parse({
    title: formData.get('title'),
    sourceType: formData.get('sourceType'),
    projectId: formData.get('projectId'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    scheduledDate: formData.get('scheduledDate'),
  });

  const { error } = await service.from('task_templates').insert({
    title: parsed.title,
    source_type: parsed.sourceType,
    project_id: parsed.projectId || null,
    start_date: parsed.sourceType === 'project_once' ? null : parsed.startDate || null,
    end_date: parsed.sourceType === 'project_once' ? null : parsed.endDate || null,
    scheduled_date: parsed.sourceType === 'project_once' ? parsed.scheduledDate || null : null,
  });

  if (error) {
    throw new Error(`创建任务模板失败：${error.message}`);
  }

  revalidatePath('/app/tasks');
  revalidatePath('/app/today');
}

export async function updateTaskTemplate(formData: FormData) {
  await requireAdmin();
  const service = createServiceRoleClient();
  const parsed = taskTemplateUpdateSchema.parse({
    id: formData.get('id'),
    title: formData.get('title'),
    sourceType: formData.get('sourceType'),
    projectId: formData.get('projectId'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    scheduledDate: formData.get('scheduledDate'),
  });

  const { error } = await service
    .from('task_templates')
    .update({
      title: parsed.title,
      source_type: parsed.sourceType,
      project_id: parsed.projectId || null,
      start_date: parsed.sourceType === 'project_once' ? null : parsed.startDate || null,
      end_date: parsed.sourceType === 'project_once' ? null : parsed.endDate || null,
      scheduled_date: parsed.sourceType === 'project_once' ? parsed.scheduledDate || null : null,
    })
    .eq('id', parsed.id);

  if (error) {
    throw new Error(`更新任务模板失败：${error.message}`);
  }

  revalidatePath('/app/tasks');
  revalidatePath('/app/today');
}

export async function toggleTaskTemplateActive(formData: FormData) {
  await requireAdmin();
  const service = createServiceRoleClient();
  const parsed = taskTemplateIdSchema.parse({ id: formData.get('id') });
  const nextActive = String(formData.get('nextActive')) === 'true';

  const { error } = await service.from('task_templates').update({ is_active: nextActive }).eq('id', parsed.id);

  if (error) {
    throw new Error(`更新任务模板状态失败：${error.message}`);
  }

  revalidatePath('/app/tasks');
  revalidatePath('/app/today');
}

export async function deleteTaskTemplate(formData: FormData) {
  await requireAdmin();
  const service = createServiceRoleClient();
  const parsed = taskTemplateIdSchema.parse({ id: formData.get('id') });

  const { error } = await service.from('task_templates').delete().eq('id', parsed.id);

  if (error) {
    throw new Error(`删除任务模板失败：${error.message}`);
  }

  revalidatePath('/app/tasks');
  revalidatePath('/app/today');
}

export async function toggleDailyTask(formData: FormData) {
  await requireAdmin();
  const service = createServiceRoleClient();
  const parsed = taskToggleSchema.parse({
    taskId: formData.get('taskId'),
    nextStatus: formData.get('nextStatus'),
  });

  const { error } = await service
    .from('daily_tasks')
    .update({
      status: parsed.nextStatus,
      completed_at: parsed.nextStatus === 'completed' ? new Date().toISOString() : null,
    })
    .eq('id', parsed.taskId);

  if (error) {
    throw new Error(`更新任务失败：${error.message}`);
  }

  revalidatePath('/app/today');
  revalidatePath('/app/tasks');
  revalidatePath('/app/progress');
}

export async function createTemporaryTask(formData: FormData) {
  await requireAdmin();
  const service = createServiceRoleClient();
  const parsed = tempTaskSchema.parse({
    title: formData.get('title'),
  });

  const { error } = await service.from('daily_tasks').insert({
    task_date: new Date().toISOString().slice(0, 10),
    title: parsed.title,
    source_type: 'temporary',
    is_temporary: true,
  });

  if (error) {
    throw new Error(`创建临时任务失败：${error.message}`);
  }

  revalidatePath('/app/today');
  revalidatePath('/app/tasks');
}

export async function deleteDailyTask(formData: FormData) {
  await requireAdmin();
  const service = createServiceRoleClient();
  const parsed = dailyTaskIdSchema.parse({
    taskId: formData.get('taskId'),
  });

  const { error } = await service.from('daily_tasks').delete().eq('id', parsed.taskId);

  if (error) {
    throw new Error(`删除当天任务失败：${error.message}`);
  }

  revalidatePath('/app/today');
  revalidatePath('/app/tasks');
  revalidatePath('/app/progress');
}

export async function createPost(formData: FormData) {
  const profile = await requireAdmin();
  const service = createServiceRoleClient();
  const parsed = postSchema.parse({
    title: formData.get('title'),
    coverUrl: formData.get('coverUrl'),
    excerpt: formData.get('excerpt'),
    content: formData.get('content'),
  });
  const payload = buildPostPayload(parsed);

  const { error } = await service.from('daily_posts').insert({
    ...payload,
    author_id: profile.id,
  });

  if (error) {
    throw new Error(`发布文章失败：${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/articles');
  revalidatePath(`/articles/${payload.slug}`);
  revalidatePath('/app/today');
}

export async function updateProfileRole(formData: FormData) {
  await requireAdmin();
  const service = createServiceRoleClient();
  const parsed = userRoleSchema.parse({
    profileId: formData.get('profileId'),
    role: formData.get('role'),
    canViewArticles: formData.get('canViewArticles'),
  });

  const { error } = await service
    .from('profiles')
    .update({
      role: parsed.role,
      can_view_articles: parsed.canViewArticles === 'true',
    })
    .eq('id', parsed.profileId);

  if (error) {
    throw new Error(`更新用户权限失败：${error.message}`);
  }

  revalidatePath('/app/users');
}

export async function adminCreateUser(formData: FormData) {
  await requireAdmin();

  const parsed = adminCreateUserSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    displayName: formData.get('displayName'),
    role: formData.get('role'),
    canViewArticles: formData.get('canViewArticles'),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? '用户信息不正确');
  }

  const service = createServiceRoleClient();
  const { data, error } = await service.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      display_name: parsed.data.displayName || parsed.data.email,
    },
  });

  if (error) {
    throw new Error(`创建用户失败：${error.message}`);
  }

  const userId = data.user?.id;
  if (userId) {
    const { error: profileError } = await service.from('profiles').upsert({
      id: userId,
      email: parsed.data.email,
      display_name: parsed.data.displayName || null,
      role: parsed.data.role,
      can_view_articles: parsed.data.canViewArticles === 'true',
    });

    if (profileError) {
      throw new Error(`创建用户资料失败：${profileError.message}`);
    }
  }

  revalidatePath('/app/users');
}
