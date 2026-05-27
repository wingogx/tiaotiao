import { ProjectManagement } from '@/components/app/forms';
import { SectionHeader } from '@/components/app/section-header';
import { getIncomeRecords, getProjects } from '@/lib/data/queries';

export default async function ProjectsPage() {
  const [projects, incomes] = await Promise.all([getProjects(), getIncomeRecords()]);

  const totals = new Map<string, number>();
  incomes.forEach((item) => {
    totals.set(item.project_id, (totals.get(item.project_id) ?? 0) + Number(item.amount));
  });

  return (
    <div className="space-y-5">
      <SectionHeader title="项目地图" description="每个项目是一张收入副本地图；已有收入的地图只能收起，不能直接删除。" />
      <ProjectManagement projects={projects} totals={totals} />
    </div>
  );
}
