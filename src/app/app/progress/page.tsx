import { AdminPanel, PanelHeading } from '@/components/app/admin-ui';
import { RevenueCurve } from '@/components/app/revenue-curve';
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
    <div className="space-y-6">
      <SectionHeader title="完成进度" description="这里聚合长期挑战的核心指标，只展示自动计算后的结果，不增加额外录入成本。" />

      <section className="legacy-gradient rounded-[28px] p-7 text-white shadow-[0_24px_70px_rgba(102,126,234,0.2)]">
        <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-white/64">Long Challenge</div>
            <h2 className="serif-heading mt-3 text-4xl">第 {data.currentDay} 天，还剩 {data.remainingDays} 天</h2>
            <p className="mt-3 text-sm leading-7 text-white/72">目标不是展示好看数字，而是持续暴露真实进度：收入差额、时间压力、任务执行率。</p>
          </div>
          <div className="space-y-4">
            <ProgressLine label="收入进度" value={formatPercent(data.incomeProgress)} percent={data.incomeProgress} />
            <ProgressLine label="时间进度" value={formatPercent(data.timeProgress)} percent={data.timeProgress} />
            <ProgressLine label="今日任务完成率" value={formatPercent(data.taskCompletionRate)} percent={data.taskCompletionRate} />
          </div>
        </div>
      </section>

      <AdminPanel>
        <PanelHeading title="收益曲线" description="按日期汇总收入，展示累计收益走势，用来快速看全貌。" />
        <RevenueCurve data={data.revenueCurve} />
      </AdminPanel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map(([label, value]) => (
          <AdminPanel key={label}>
            <div className="text-sm text-[var(--muted)]">{label}</div>
            <div className="serif-heading mt-3 text-3xl text-[var(--foreground)]">{value}</div>
          </AdminPanel>
        ))}
      </div>
    </div>
  );
}

function ProgressLine({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <div className="rounded-[20px] border border-white/14 bg-white/12 p-4">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="text-white/72">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/18">
        <span className="block h-full rounded-full bg-white" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
      </div>
    </div>
  );
}
