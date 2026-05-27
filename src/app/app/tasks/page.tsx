import { TaskTemplateManager, TodayTaskList } from '@/components/app/forms';
import { SectionHeader } from '@/components/app/section-header';
import { getDailyTasks, getProjects, getTaskTemplates } from '@/lib/data/queries';

export default async function TasksPage() {
  const [projects, templates, tasks] = await Promise.all([getProjects(), getTaskTemplates(), getDailyTasks()]);

  return (
    <div className="space-y-5">
      <SectionHeader title="任务养成" description="把重复动作变成每日习惯卡，完成后直接增加挑战执行力。" />
      <TaskTemplateManager projects={projects} templates={templates} />
      <TodayTaskList tasks={tasks} />
    </div>
  );
}
