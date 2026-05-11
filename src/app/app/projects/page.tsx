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
    <div>
      <SectionHeader title="项目看板" description="项目代表当前并行中的收入来源。删除前会检查是否存在收入记录；已有收入的数据只能关闭，不能删除。" />
      <ProjectManagement projects={projects} totals={totals} />
    </div>
  );
}
