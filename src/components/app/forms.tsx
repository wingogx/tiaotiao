import type { ReactNode } from 'react';
import { CheckCircle2, Circle, Coins, FileText, FolderKanban, Plus, Trash2, UserPlus } from 'lucide-react';

import type { DailyTask, Project, TaskTemplate } from '@/lib/data/queries';

import {
  adminCreateUser,
  closeProject,
  createIncomeRecord,
  createPost,
  createProject,
  createTaskTemplate,
  createTemporaryTask,
  deleteDailyTask,
  deleteProject,
  deleteTaskTemplate,
  toggleDailyTask,
  toggleTaskTemplateActive,
  updateProfileRole,
  updateProject,
  updateTaskTemplate,
} from '@/app/actions';
import { formatCurrency } from '@/lib/utils/format';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';

export function TodayIncomeForm({ projects }: { projects: Project[] }) {
  return (
    <Card className="legacy-card-hover rounded-[26px] p-5">
      <PanelTitle icon={<Coins size={19} />} title="记收入" description="收入可以为正或负，提交后同步到项目和总览。" />
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
    <Card className="legacy-card-hover rounded-[26px] p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]"><CheckCircle2 size={19} className="text-[var(--accent)]" />勾任务</div>
          <div className="mt-1 text-sm text-[var(--muted)]">
            已完成 {completedCount}，未完成 {pendingCount}，完成率 {completionRate}%
          </div>
        </div>
      </div>

      <div className="legacy-progress mb-5">
        <span style={{ width: `${completionRate}%` }} />
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted)]">今天还没有任务清单。</div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 rounded-[18px] border border-[var(--border)] bg-white/74 px-4 py-3 transition hover:border-[rgba(102,126,234,0.35)] hover:bg-white">
              <form action={toggleDailyTask}>
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="nextStatus" value={task.status === 'completed' ? 'pending' : 'completed'} />
                <button
                  type="submit"
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${task.status === 'completed' ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--border)] bg-white text-[var(--muted)]'}`}
                  aria-label={task.status === 'completed' ? '标记为未完成' : '标记为已完成'}
                >
                  {task.status === 'completed' ? <CheckCircle2 size={16} /> : <Circle size={14} />}
                </button>
              </form>
              <div className="min-w-0 flex-1">
                <div className={`text-sm ${task.status === 'completed' ? 'text-[var(--muted)] line-through' : 'text-[var(--foreground)]'}`}>{task.title}</div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  {sourceTypeLabel(task.source_type)} {task.projects?.name ? `· ${task.projects.name}` : ''}
                </div>
              </div>
              {task.is_temporary ? (
                <form action={deleteDailyTask}>
                  <input type="hidden" name="taskId" value={task.id} />
                  <button type="submit" className="rounded-full p-2 text-[var(--muted)] transition hover:bg-red-50 hover:text-[var(--danger)]" aria-label="删除临时任务">
                    <Trash2 size={15} />
                  </button>
                </form>
              ) : null}
            </div>
          ))
        )}
      </div>

      <form action={createTemporaryTask} className="mt-4 flex gap-3">
        <Input name="title" placeholder="追加今天的临时任务" />
        <Button variant="secondary"><Plus size={16} />新增</Button>
      </form>
    </Card>
  );
}

export function TodayPostForm() {
  return (
    <Card className="legacy-card-hover rounded-[26px] p-5">
      <PanelTitle icon={<FileText size={19} />} title="写文章" description="Markdown 正文直接粘贴即可，前台先展示标题和摘要。" />
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
      <Card className="legacy-card-hover rounded-[26px] p-5">
        <PanelTitle icon={<FolderKanban size={19} />} title="创建项目" description="例如小红书、视频号、星球，每个收入都归属到一个项目。" />
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
            <Card key={project.id} className="legacy-card-hover rounded-[26px] p-5">
              <div className="mb-4 flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
                <div>
                  <div className="text-xl font-semibold text-[var(--foreground)]">{project.name}</div>
                  <div className="mt-1 text-sm text-[var(--muted)]">{project.notes || '暂无备注'}</div>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${project.status === 'active' ? 'bg-[rgba(102,126,234,0.1)] text-[var(--accent)]' : 'bg-slate-100 text-slate-500'}`}>
                  {project.status === 'active' ? '进行中' : '已关闭'}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                <form action={updateProject} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <input type="hidden" name="id" value={project.id} />
                  <Input name="name" defaultValue={project.name} />
                  <Input name="notes" defaultValue={project.notes ?? ''} placeholder="备注" />
                  <Button variant="secondary">保存</Button>
                </form>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-full border border-[var(--border)] bg-white/74 px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
                    {formatCurrency(total)}
                  </div>
                  {project.status === 'active' ? (
                    <form action={closeProject}>
                      <input type="hidden" name="id" value={project.id} />
                      <Button variant="secondary">关闭</Button>
                    </form>
                  ) : null}
                  <form action={deleteProject}>
                    <input type="hidden" name="id" value={project.id} />
                    <Button variant="danger"><Trash2 size={16} />删除</Button>
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
      <Card className="legacy-card-hover rounded-[26px] p-5">
        <PanelTitle icon={<CheckCircle2 size={19} />} title="新增任务模板" description="固定任务每天生成；项目任务可每天生成，也可指定日期生成。" />
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
          <Card key={template.id} className="legacy-card-hover rounded-[24px] p-5">
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
              <div>
                <div className="text-base font-medium text-[var(--foreground)]">{template.title}</div>
                <div className="mt-2 text-sm text-[var(--muted)]">
                  {sourceTypeLabel(template.source_type)}
                  {template.projects?.name ? ` · ${template.projects.name}` : ''}
                  {template.scheduled_date ? ` · ${template.scheduled_date}` : ''}
                </div>
              </div>
              <div className={`rounded-full px-3 py-1 text-xs font-semibold ${template.is_active ? 'bg-[rgba(102,126,234,0.1)] text-[var(--accent)]' : 'bg-slate-100 text-slate-500'}`}>
                {template.is_active ? '启用中' : '已停用'}
              </div>
            </div>

            <form action={updateTaskTemplate} className="grid gap-3 lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.8fr_auto] lg:items-center">
              <input type="hidden" name="id" value={template.id} />
              <Input name="title" defaultValue={template.title} placeholder="任务标题" required />
              <select
                name="sourceType"
                defaultValue={template.source_type}
                className="h-11 rounded-2xl border border-[var(--border)] bg-white/80 px-4 text-sm outline-none focus:border-[var(--accent)]"
                required
              >
                <option value="fixed">固定任务</option>
                <option value="project_daily">项目每日任务</option>
                <option value="project_once">项目指定日期任务</option>
              </select>
              <select
                name="projectId"
                defaultValue={template.project_id ?? ''}
                className="h-11 rounded-2xl border border-[var(--border)] bg-white/80 px-4 text-sm outline-none focus:border-[var(--accent)]"
              >
                <option value="">不绑定项目</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <Input type="date" name="scheduledDate" defaultValue={template.scheduled_date ?? ''} />
              <Button variant="secondary">保存</Button>
            </form>

            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <form action={toggleTaskTemplateActive}>
                <input type="hidden" name="id" value={template.id} />
                <input type="hidden" name="nextActive" value={template.is_active ? 'false' : 'true'} />
                <Button variant="secondary">{template.is_active ? '停用' : '启用'}</Button>
              </form>
              <form action={deleteTaskTemplate}>
                <input type="hidden" name="id" value={template.id} />
                <Button variant="danger"><Trash2 size={16} />删除</Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function UserRoleManager({ profiles }: { profiles: Array<{ id: string; email: string; role: string; can_view_articles: boolean }> }) {
  return (
    <div className="space-y-6">
      <Card className="legacy-card-hover rounded-[26px] p-5">
        <PanelTitle icon={<UserPlus size={19} />} title="创建用户" description="管理员手动创建或开通会员权限，第一版不接支付。" />
        <form action={adminCreateUser} className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_0.8fr_0.8fr_auto]">
          <Input name="email" type="email" placeholder="邮箱" required />
          <Input name="password" type="password" placeholder="初始密码" required />
          <Input name="displayName" placeholder="昵称，可选" />
          <select
            name="role"
            defaultValue="member"
            className="h-11 rounded-2xl border border-[var(--border)] bg-white/80 px-4 text-sm outline-none focus:border-[var(--accent)]"
          >
            <option value="guest">guest</option>
            <option value="member">member</option>
            <option value="admin">admin</option>
          </select>
          <select
            name="canViewArticles"
            defaultValue="true"
            className="h-11 rounded-2xl border border-[var(--border)] bg-white/80 px-4 text-sm outline-none focus:border-[var(--accent)]"
          >
            <option value="false">文章不可见</option>
            <option value="true">文章可见</option>
          </select>
          <Button>创建</Button>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="legacy-card-hover rounded-[24px] p-5">
          <div className="text-sm text-[var(--muted)]">总用户</div>
          <div className="serif-heading mt-2 text-3xl">{profiles.length}</div>
        </Card>
        <Card className="legacy-card-hover rounded-[24px] p-5">
          <div className="text-sm text-[var(--muted)]">会员</div>
          <div className="serif-heading mt-2 text-3xl">{profiles.filter((item) => item.role === 'member').length}</div>
        </Card>
        <Card className="legacy-card-hover rounded-[24px] p-5">
          <div className="text-sm text-[var(--muted)]">可看正文</div>
          <div className="serif-heading mt-2 text-3xl">{profiles.filter((item) => item.can_view_articles).length}</div>
        </Card>
      </div>

      <div className="space-y-4">
      {profiles.map((profile) => (
        <Card key={profile.id} className="legacy-card-hover rounded-[24px] p-5">
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
    </div>
  );
}

function PanelTitle({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]">
        <span className="text-[var(--accent)]">{icon}</span>
        {title}
      </div>
      <div className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</div>
    </div>
  );
}

function sourceTypeLabel(sourceType: DailyTask['source_type'] | TaskTemplate['source_type']) {
  const labels = {
    fixed: '固定任务',
    project_daily: '项目每日',
    project_once: '指定日期',
    temporary: '临时任务',
  } as const;

  return labels[sourceType];
}
