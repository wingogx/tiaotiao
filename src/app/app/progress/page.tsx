import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/app/section-header';
import { getProgressData } from '@/lib/data/queries';
import { formatCurrency, formatPercent } from '@/lib/utils/format';

export default async function ProgressPage() {
  const data = await getProgressData();

  const items = [
    ['当前第几天', `第 ${data.currentDay} 天`],
    ['剩余天数', `${data.remainingDays} 天`],
    ['累计收入', formatCurrency(data.totalRevenue)],
    ['时间进度', formatPercent(data.timeProgress)],
    ['收入进度', formatPercent(data.incomeProgress)],
    ['距目标差额', formatCurrency(data.gapToGoal)],
    ['今日已完成任务', `${data.completedTasks}`],
    ['今日未完成任务', `${data.pendingTasks}`],
    ['今日任务完成率', formatPercent(data.taskCompletionRate)],
  ];

  return (
    <div>
      <SectionHeader title="完成进度" description="这里聚合长期挑战的核心指标，只展示自动计算后的结果，不增加额外录入成本。" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map(([label, value]) => (
          <Card key={label} className="rounded-[28px] p-5">
            <div className="text-sm text-[var(--muted)]">{label}</div>
            <div className="serif-heading mt-3 text-3xl text-[var(--foreground)]">{value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
