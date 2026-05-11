import { TaskTemplateManager, TodayTaskList } from '@/components/app/forms';
import { SectionHeader } from '@/components/app/section-header';
import { getDailyTasks, getProjects, getTaskTemplates } from '@/lib/data/queries';

export default async function TasksPage() {
  const [projects, templates, tasks] = await Promise.all([getProjects(), getTaskTemplates(), getDailyTasks()]);

  return (
    <div className="space-y-6">
      <SectionHeader title="任务跟踪" description="当天任务清单由固定任务模板、项目每日任务模板、指定日期模板和临时任务组成。" />
      <TaskTemplateManager projects={projects} templates={templates} />
      <TodayTaskList tasks={tasks} />
    </div>
  );
}
