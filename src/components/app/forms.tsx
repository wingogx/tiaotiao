import type { DailyTask, Project, TaskTemplate } from '@/lib/data/queries';

import {
  closeProject,
  createIncomeRecord,
  createPost,
  createProject,
  createTaskTemplate,
  createTemporaryTask,
  deleteProject,
  toggleDailyTask,
  updateProfileRole,
  updateProject,
} from '@/app/actions';
import { formatCurrency } from '@/lib/utils/format';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';

export function TodayIncomeForm({ projects }: { projects: Project[] }) {
  return (
    <Card className="rounded-[30px] p-5">
      <div className="mb-4 text-lg font-semibold text-[var(--foreground)]">记收入</div>
      <form action={createIncomeRecord} className="space-y-3">
        <select
          name="projectId"
          className="h-11 w-full rounded-2xl border border-[var(--border)] bg-white/80 px-4 text-sm outline-none focus:border-[var(--accent)]"
          required
        >
          <option value="">选择项目</option>
          {projects.filter((item) => item.status === 'active').map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <Input type="number" name="amount" step="0.01" placeholder="金额，可为负数" required />
        <Input name="note" placeholder="备注，可选" />
        <Button fullWidth>保存当天收入</Button>
      </form>
    </Card>
  );
}

export function TodayTaskList({ tasks }: { tasks: DailyTask[] }) {
  const completedCount = tasks.filter((item) => item.status === 'completed').length;
  const pendingCount = tasks.length - completedCount;
  const completionRate = tasks.length > 0 ? ((completedCount / tasks.length) * 100).toFixed(0) : '0';

  return (
    <Card className="rounded-[30px] p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-lg font-semibold text-[var(--foreground)]">勾任务</div>
          <div className="mt-1 text-sm text-[var(--muted)]">
            已完成 {completedCount}，未完成 {pendingCount}，完成率 {completionRate}%
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted)]">今天还没有任务清单。</div>
        ) : (
          tasks.map((task) => (
            <form key={task.id} action={toggleDailyTask} className="flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-white/70 px-4 py-3">
              <input type="hidden" name="taskId" value={task.id} />
              <input type="hidden" name="nextStatus" value={task.status === 'completed' ? 'pending' : 'completed'} />
              <button
                type="submit"
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${task.status === 'completed' ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--border)] bg-white'}`}
                aria-label={task.status === 'completed' ? '标记为未完成' : '标记为已完成'}
              >
                {task.status === 'completed' ? '✓' : ''}
              </button>
              <div className="min-w-0 flex-1">
                <div className={`text-sm ${task.status === 'completed' ? 'text-[var(--muted)] line-through' : 'text-[var(--foreground)]'}`}>{task.title}</div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  {task.source_type} {task.projects?.name ? `· ${task.projects.name}` : ''}
                </div>
              </div>
            </form>
          ))
        )}
      </div>

      <form action={createTemporaryTask} className="mt-4 flex gap-3">
        <Input name="title" placeholder="追加今天的临时任务" />
        <Button variant="secondary">新增</Button>
      </form>
    </Card>
  );
}

export function TodayPostForm() {
  return (
    <Card className="rounded-[30px] p-5">
      <div className="mb-4 text-lg font-semibold text-[var(--foreground)]">写文章</div>
      <form action={createPost} className="space-y-3">
        <Input name="title" placeholder="文章标题" required />
        <Input name="coverUrl" placeholder="封面链接，可选" />
        <Textarea name="excerpt" placeholder="摘要，可选。不填则自动提取正文前几句。" className="min-h-24" />
        <Textarea name="content" placeholder="支持 Markdown，直接粘贴正文即可。" className="min-h-72" required />
        <Button fullWidth>发布文章</Button>
      </form>
    </Card>
  );
}

export function ProjectManagement({ projects, totals }: { projects: Project[]; totals: Map<string, number> }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.84fr_1.16fr]">
      <Card className="rounded-[30px] p-5">
        <div className="mb-4 text-lg font-semibold text-[var(--foreground)]">创建项目</div>
        <form action={createProject} className="space-y-3">
          <Input name="name" placeholder="项目名称，例如小红书" required />
          <Textarea name="notes" placeholder="项目备注，可选" className="min-h-24" />
          <Button fullWidth>创建项目</Button>
        </form>
      </Card>

      <div className="space-y-4">
        {projects.map((project) => {
          const total = totals.get(project.id) ?? 0;
          return (
            <Card key={project.id} className="rounded-[30px] p-5">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                <form action={updateProject} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <input type="hidden" name="id" value={project.id} />
                  <Input name="name" defaultValue={project.name} />
                  <Input name="notes" defaultValue={project.notes ?? ''} placeholder="备注" />
                  <Button variant="secondary">保存</Button>
                </form>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)]">
                    {project.status === 'active' ? '进行中' : '已关闭'} · {formatCurrency(total)}
                  </div>
                  {project.status === 'active' ? (
                    <form action={closeProject}>
                      <input type="hidden" name="id" value={project.id} />
                      <Button variant="secondary">关闭</Button>
                    </form>
                  ) : null}
                  <form action={deleteProject}>
                    <input type="hidden" name="id" value={project.id} />
                    <Button variant="danger">删除</Button>
                  </form>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function TaskTemplateManager({ projects, templates }: { projects: Project[]; templates: TaskTemplate[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
      <Card className="rounded-[30px] p-5">
        <div className="mb-4 text-lg font-semibold text-[var(--foreground)]">新增任务模板</div>
        <form action={createTaskTemplate} className="space-y-3">
          <Input name="title" placeholder="任务标题" required />
          <select
            name="sourceType"
            className="h-11 w-full rounded-2xl border border-[var(--border)] bg-white/80 px-4 text-sm outline-none focus:border-[var(--accent)]"
            required
          >
            <option value="fixed">固定任务</option>
            <option value="project_daily">项目每日任务</option>
            <option value="project_once">项目指定日期任务</option>
          </select>
          <select
            name="projectId"
            className="h-11 w-full rounded-2xl border border-[var(--border)] bg-white/80 px-4 text-sm outline-none focus:border-[var(--accent)]"
          >
            <option value="">不绑定项目</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <Input type="date" name="scheduledDate" />
          <Button fullWidth>保存模板</Button>
        </form>
      </Card>

      <div className="space-y-4">
        {templates.map((template) => (
          <Card key={template.id} className="rounded-[28px] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-medium text-[var(--foreground)]">{template.title}</div>
                <div className="mt-2 text-sm text-[var(--muted)]">
                  {template.source_type}
                  {template.projects?.name ? ` · ${template.projects.name}` : ''}
                  {template.scheduled_date ? ` · ${template.scheduled_date}` : ''}
                </div>
              </div>
              <div className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                {template.is_active ? '启用中' : '已停用'}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function UserRoleManager({ profiles }: { profiles: Array<{ id: string; email: string; role: string; can_view_articles: boolean }> }) {
  return (
    <div className="space-y-4">
      {profiles.map((profile) => (
        <Card key={profile.id} className="rounded-[28px] p-5">
          <form action={updateProfileRole} className="grid gap-3 lg:grid-cols-[1.3fr_0.7fr_0.7fr_auto] lg:items-center">
            <input type="hidden" name="profileId" value={profile.id} />
            <div>
              <div className="text-base font-medium text-[var(--foreground)]">{profile.email}</div>
              <div className="mt-1 text-sm text-[var(--muted)]">当前角色：{profile.role}</div>
            </div>

            <select
              name="role"
              defaultValue={profile.role}
              className="h-11 rounded-2xl border border-[var(--border)] bg-white/80 px-4 text-sm outline-none focus:border-[var(--accent)]"
            >
              <option value="guest">guest</option>
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>

            <select
              name="canViewArticles"
              defaultValue={profile.can_view_articles ? 'true' : 'false'}
              className="h-11 rounded-2xl border border-[var(--border)] bg-white/80 px-4 text-sm outline-none focus:border-[var(--accent)]"
            >
              <option value="false">文章不可见</option>
              <option value="true">文章可见</option>
            </select>

            <Button variant="secondary">更新</Button>
          </form>
        </Card>
      ))}
    </div>
  );
}
