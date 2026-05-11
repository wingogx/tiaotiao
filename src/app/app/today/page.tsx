import { TodayIncomeForm, TodayPostForm, TodayTaskList } from '@/components/app/forms';
import { SectionHeader } from '@/components/app/section-header';
import { getDailyTasks, getProjects } from '@/lib/data/queries';

export default async function TodayPage() {
  const [projects, tasks] = await Promise.all([getProjects(), getDailyTasks()]);

  return (
    <div>
      <SectionHeader title="今日录入" description="每天只需要录三件事：记收入、勾任务、写文章。其余统计交给系统自动计算。" />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <TodayIncomeForm projects={projects} />
          <TodayPostForm />
        </div>
        <TodayTaskList tasks={tasks} />
      </div>
    </div>
  );
}
