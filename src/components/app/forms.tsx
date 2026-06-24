import { CheckCircle2, Circle, Coins, FileText, FolderKanban, Plus, Trash2, UserPlus } from 'lucide-react';

import type { DailyTask, Project, TaskTemplate } from '@/lib/data/queries';
import { incomeTypeOptions, postTypeOptions } from '@/lib/data/queries';

import {
  adminCreateUser,
  closeProject,
  createIncomeRecord,
  createPost,
  createProject,
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

import { AdminPanel, EmptyState, Field, PanelHeading, StatusBadge, selectClassName } from '@/components/app/admin-ui';
import { TaskTemplateCreateForm } from '@/components/app/task-template-create-form';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';

export function TodayIncomeForm({ projects }: { projects: Project[] }) {
  return (
    <AdminPanel>
      <PanelHeading icon={<Coins size={19} />} title="收入投喂" description="给今天的记录增加经验值；退款或回撤可以填负数。" />
      <form action={createIncomeRecord} className="space-y-4">
        <Field label="归属项目">
          <select name="projectId" className={selectClassName} required>
            <option value="">选择项目</option>
            {projects.filter((item) => item.status === 'active').map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="收入类型">
          <select name="incomeType" className={selectClassName} defaultValue="content" required>
            {incomeTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="收入金额" hint="人民币金额，可填写负数">
          <Input type="number" name="amount" step="0.01" placeholder="例如 128.00" required inputMode="decimal" />
        </Field>
        <Field label="备注">
          <Input name="note" placeholder="可选，例如订单来源、退款原因" />
        </Field>
        <Button fullWidth className="h-12 rounded-[20px] font-black">保存收入经验</Button>
      </form>
    </AdminPanel>
  );
}

export function TodayTaskList({ tasks }: { tasks: DailyTask[] }) {
  const completedCount = tasks.filter((item) => item.status === 'completed').length;
  const pendingCount = tasks.length - completedCount;
  const completionRate = tasks.length > 0 ? ((completedCount / tasks.length) * 100).toFixed(0) : '0';

  return (
    <AdminPanel>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-black text-[var(--neko-ink)]"><CheckCircle2 size={19} className="text-[var(--neko-red)]" />今日任务</div>
          <div className="mt-1 text-sm text-[var(--neko-muted)]">
            已完成 {completedCount}，未完成 {pendingCount}，完成率 {completionRate}%
          </div>
        </div>
      </div>

      <div className="legacy-progress mb-5">
        <span style={{ width: `${completionRate}%` }} />
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <EmptyState>今天还没有任务清单。</EmptyState>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 rounded-[24px] border border-[var(--neko-line)] bg-white/72 px-4 py-4 shadow-sm transition hover:bg-white">
              <form action={toggleDailyTask}>
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="nextStatus" value={task.status === 'completed' ? 'pending' : 'completed'} />
                <button
                  type="submit"
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${task.status === 'completed' ? 'border-[var(--neko-red)] bg-[var(--neko-red)] text-white' : 'border-[var(--neko-line)] bg-white text-[var(--neko-muted)]'}`}
                  aria-label={task.status === 'completed' ? '标记为未完成' : '标记为已完成'}
                >
                  {task.status === 'completed' ? <CheckCircle2 size={16} /> : <Circle size={14} />}
                </button>
              </form>
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-bold ${task.status === 'completed' ? 'text-[var(--neko-muted)] line-through' : 'text-[var(--neko-ink)]'}`}>{task.title}</div>
                <div className="mt-1 text-xs text-[var(--neko-muted)]">
                  {sourceTypeLabel(task.source_type)} {task.projects?.name ? `· ${task.projects.name}` : ''}
                </div>
              </div>
              {task.is_temporary ? (
                <form action={deleteDailyTask}>
                  <input type="hidden" name="taskId" value={task.id} />
                  <button type="submit" className="rounded-full p-2 text-[var(--neko-muted)] transition hover:bg-red-50 hover:text-[var(--danger)]" aria-label="删除临时任务">
                    <Trash2 size={15} />
                  </button>
                </form>
              ) : null}
            </div>
          ))
        )}
      </div>

      <form action={createTemporaryTask} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <Input name="title" placeholder="追加今天的临时任务" />
        <Button variant="secondary" className="h-12 rounded-[20px]"><Plus size={16} />新增</Button>
      </form>
    </AdminPanel>
  );
}

export function TodayPostForm() {
  return (
    <AdminPanel>
      <PanelHeading icon={<FileText size={19} />} title="复盘存档" description="把今天的判断、问题和收获存成一张公开摘要卡。" />
      <form action={createPost} className="space-y-4">
        <Field label="复盘标题"><Input name="title" placeholder="今天最重要的结论" required /></Field>
        <Field label="内容类型">
          <select name="postType" className={selectClassName} defaultValue="business_review" required>
            {postTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="封面链接"><Input name="coverUrl" placeholder="可选，填写图片 URL" /></Field>
        <Field label="公开摘要" hint="不填则自动提取正文前几句"><Textarea name="excerpt" placeholder="给游客看的简短摘要" className="min-h-24" /></Field>
        <Field label="完整复盘"><Textarea name="content" placeholder="支持 Markdown，记录完整正文" className="min-h-72" required /></Field>
        <Button fullWidth className="h-12 rounded-[20px] font-black">发布复盘</Button>
      </form>
    </AdminPanel>
  );
}

export function ProjectManagement({ projects, totals }: { projects: Project[]; totals: Map<string, number> }) {
  return (
    <div className="grid gap-5 md:grid-cols-[0.86fr_1.14fr]">
      <AdminPanel>
        <PanelHeading icon={<FolderKanban size={19} />} title="解锁新收入地图" description="每个项目就是一个收益副本，后续收入都归属到这里。" />
        <form action={createProject} className="space-y-4">
          <Field label="项目名称"><Input name="name" placeholder="例如小红书 / 视频号 / 产品销售" required /></Field>
          <Field label="项目备注"><Textarea name="notes" placeholder="定位、变现方式、当前推进重点" className="min-h-28" /></Field>
          <Button fullWidth className="h-12 rounded-[20px] font-black">创建项目地图</Button>
        </form>
      </AdminPanel>

      <div className="space-y-4">
        {projects.map((project) => {
          const total = totals.get(project.id) ?? 0;
          return (
            <AdminPanel key={project.id}>
              <div className="mb-4 flex items-start justify-between gap-4 border-b border-[var(--neko-line)] pb-4">
                <div>
                  <div className="text-xl font-black text-[var(--neko-ink)]">{project.name}</div>
                  <div className="mt-1 text-sm leading-6 text-[var(--neko-muted)]">{project.notes || '暂无备注'}</div>
                </div>
                <StatusBadge tone={project.status === 'active' ? 'active' : 'neutral'}>{project.status === 'active' ? '进行中' : '已关闭'}</StatusBadge>
              </div>

              <div className="grid gap-4">
                <form action={updateProject} className="grid gap-3">
                  <input type="hidden" name="id" value={project.id} />
                  <div className="grid gap-3">
                    <Field label="项目名称">
                      <Input name="name" defaultValue={project.name} placeholder="项目名称" />
                    </Field>
                    <Field label="项目备注">
                      <Input name="notes" defaultValue={project.notes ?? ''} placeholder="项目备注" />
                    </Field>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="secondary" className="h-11 rounded-[18px]">保存</Button>
                  </div>
                </form>

                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[var(--neko-line)] pt-4">
                  <div className="mr-auto rounded-full border border-[var(--neko-line)] bg-white/74 px-4 py-2 text-sm font-black text-[var(--neko-ink)]">
                    {formatCurrency(total)}
                  </div>
                  {project.status === 'active' ? (
                    <form action={closeProject}>
                      <input type="hidden" name="id" value={project.id} />
                      <Button variant="secondary" className="h-11 rounded-[18px]">收起</Button>
                    </form>
                  ) : null}
                  <form action={deleteProject}>
                    <input type="hidden" name="id" value={project.id} />
                    <Button variant="danger" className="h-11 rounded-[18px]"><Trash2 size={16} />删除</Button>
                  </form>
                </div>
              </div>
            </AdminPanel>
          );
        })}
      </div>
    </div>
  );
}

export function TaskTemplateManager({ projects, templates }: { projects: Project[]; templates: TaskTemplate[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-[0.86fr_1.14fr]">
      <AdminPanel>
        <PanelHeading icon={<CheckCircle2 size={19} />} title="添加养成习惯" description="固定任务每天出现；项目任务会绑定收入地图；指定任务只在某天出现。" />
        <TaskTemplateCreateForm projects={projects} />
      </AdminPanel>

      <div className="space-y-4">
        {templates.map((template) => (
          <AdminPanel key={template.id}>
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-[var(--neko-line)] pb-4">
              <div>
                <div className="text-base font-black text-[var(--neko-ink)]">{template.title}</div>
                <div className="mt-2 text-sm leading-6 text-[var(--neko-muted)]">
                  {sourceTypeLabel(template.source_type)}
                  {template.projects?.name ? ` · ${template.projects.name}` : ''}
                  {template.start_date || template.end_date ? ` · ${template.start_date ?? '不限开始'} 至 ${template.end_date ?? '不限结束'}` : ''}
                  {template.scheduled_date ? ` · ${template.scheduled_date}` : ''}
                </div>
              </div>
              <StatusBadge tone={template.is_active ? 'active' : 'neutral'}>{template.is_active ? '启用中' : '已停用'}</StatusBadge>
            </div>

            <form action={updateTaskTemplate} className="grid gap-3">
              <input type="hidden" name="id" value={template.id} />
              <Field label="任务标题"><Input name="title" defaultValue={template.title} placeholder="任务标题" required /></Field>
              <Field label="类型">
                <select name="sourceType" defaultValue={template.source_type} className={selectClassName} required>
                  <option value="fixed">固定任务</option>
                  <option value="project_daily">项目每日任务</option>
                  <option value="project_once">项目指定日期任务</option>
                </select>
              </Field>
              <Field label="项目">
                <select name="projectId" defaultValue={template.project_id ?? ''} className={selectClassName}>
                  <option value="">不绑定项目</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="开始"><Input type="date" name="startDate" defaultValue={template.start_date ?? ''} /></Field>
              <Field label="结束"><Input type="date" name="endDate" defaultValue={template.end_date ?? ''} /></Field>
              <Field label="指定"><Input type="date" name="scheduledDate" defaultValue={template.scheduled_date ?? ''} /></Field>
              <Button variant="secondary" className="h-11 rounded-[18px]">保存习惯</Button>
            </form>

            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <form action={toggleTaskTemplateActive}>
                <input type="hidden" name="id" value={template.id} />
                <input type="hidden" name="nextActive" value={template.is_active ? 'false' : 'true'} />
                <Button variant="secondary" className="h-11 rounded-[18px]">{template.is_active ? '停用' : '启用'}</Button>
              </form>
              <form action={deleteTaskTemplate}>
                <input type="hidden" name="id" value={template.id} />
                <Button variant="danger" className="h-11 rounded-[18px]"><Trash2 size={16} />删除</Button>
              </form>
            </div>
          </AdminPanel>
        ))}
      </div>
    </div>
  );
}

export function UserRoleManager({ profiles }: { profiles: Array<{ id: string; email: string; role: string; can_view_articles: boolean }> }) {
  return (
    <div className="space-y-5">
      <AdminPanel>
        <PanelHeading icon={<UserPlus size={19} />} title="邀请新伙伴" description="创建账号或开通会员权限，让用户进入复盘内容区。" />
        <form action={adminCreateUser} className="grid gap-3 md:grid-cols-2">
          <Field label="邮箱"><Input name="email" type="email" placeholder="user@example.com" required /></Field>
          <Field label="初始密码"><Input name="password" type="password" placeholder="至少 8 位" required /></Field>
          <Field label="昵称"><Input name="displayName" placeholder="可选" /></Field>
          <Field label="角色">
            <select name="role" defaultValue="member" className={selectClassName}>
              <option value="guest">guest</option>
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>
          </Field>
          <Field label="文章权限">
            <select name="canViewArticles" defaultValue="true" className={selectClassName}>
              <option value="false">文章不可见</option>
              <option value="true">文章可见</option>
            </select>
          </Field>
          <Button className="h-12 rounded-[20px] md:self-end">创建伙伴</Button>
        </form>
      </AdminPanel>

      <div className="grid gap-4 md:grid-cols-3">
        <AdminPanel>
          <div className="text-sm text-[var(--neko-muted)]">伙伴总数</div>
          <div className="mt-2 text-3xl font-black text-[var(--neko-ink)]">{profiles.length}</div>
        </AdminPanel>
        <AdminPanel>
          <div className="text-sm text-[var(--neko-muted)]">会员伙伴</div>
          <div className="mt-2 text-3xl font-black text-[var(--neko-ink)]">{profiles.filter((item) => item.role === 'member').length}</div>
        </AdminPanel>
        <AdminPanel>
          <div className="text-sm text-[var(--neko-muted)]">正文权限</div>
          <div className="mt-2 text-3xl font-black text-[var(--neko-ink)]">{profiles.filter((item) => item.can_view_articles).length}</div>
        </AdminPanel>
      </div>

      <div className="space-y-4">
      {profiles.map((profile) => (
        <AdminPanel key={profile.id}>
          <form action={updateProfileRole} className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto] md:items-end">
            <input type="hidden" name="profileId" value={profile.id} />
            <div>
              <div className="text-base font-black text-[var(--neko-ink)]">{profile.email}</div>
              <div className="mt-2 flex flex-wrap gap-2 text-sm text-[var(--neko-muted)]">
                <StatusBadge tone={profile.role === 'admin' ? 'active' : profile.role === 'member' ? 'success' : 'neutral'}>{profile.role}</StatusBadge>
                <StatusBadge tone={profile.can_view_articles ? 'success' : 'neutral'}>{profile.can_view_articles ? '可看正文' : '正文未开通'}</StatusBadge>
              </div>
            </div>

            <Field label="角色">
              <select name="role" defaultValue={profile.role} className={selectClassName}>
                <option value="guest">guest</option>
                <option value="member">member</option>
                <option value="admin">admin</option>
              </select>
            </Field>

            <Field label="文章权限">
              <select name="canViewArticles" defaultValue={profile.can_view_articles ? 'true' : 'false'} className={selectClassName}>
                <option value="false">文章不可见</option>
                <option value="true">文章可见</option>
              </select>
            </Field>

            <Button variant="secondary" className="h-12 rounded-[20px]">更新</Button>
          </form>
        </AdminPanel>
      ))}
      </div>
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
