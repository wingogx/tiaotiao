import { AdminPanel, PanelHeading } from '@/components/app/admin-ui';
import { RevenueCurve } from '@/components/app/revenue-curve';
import { SectionHeader } from '@/components/app/section-header';
import { getProgressData } from '@/lib/data/queries';
import { formatCurrency, formatPercent } from '@/lib/utils/format';

export default async function ProgressPage() {
  const data = await getProgressData();

  const items = [
    ['当前关卡', `第 ${data.currentDay} 天`],
    ['剩余关卡', `${data.remainingDays} 天`],
    ['累计经验', formatCurrency(data.totalRevenue)],
    ['时间进度', formatPercent(data.timeProgress)],
    ['收入进度', formatPercent(data.incomeProgress)],
    ['目标缺口', formatCurrency(data.gapToGoal)],
    ['今日完成', `${data.completedTasks}`],
    ['今日待完成', `${data.pendingTasks}`],
    ['今日执行率', formatPercent(data.taskCompletionRate)],
  ];

  return (
    <div className="space-y-5">
      <SectionHeader title="挑战进度" description="聚合长期挑战的核心指标，像游戏进度一样持续显示真实状态。" />

      <section className="legacy-gradient rounded-[32px] p-7 text-white shadow-[0_24px_70px_rgba(201,101,113,0.2)]">
        <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-white/64">Long Challenge</div>
            <h2 className="mt-3 text-4xl font-black">第 {data.currentDay} 天，还剩 {data.remainingDays} 天</h2>
            <p className="mt-3 text-sm leading-7 text-white/72">这里不是装饰数字，而是暴露真实挑战进度：收入差额、时间压力、任务执行率。</p>
          </div>
          <div className="space-y-4">
            <ProgressLine label="收入进度" value={formatPercent(data.incomeProgress)} percent={data.incomeProgress} />
            <ProgressLine label="时间进度" value={formatPercent(data.timeProgress)} percent={data.timeProgress} />
            <ProgressLine label="今日任务完成率" value={formatPercent(data.taskCompletionRate)} percent={data.taskCompletionRate} />
          </div>
        </div>
      </section>

      <AdminPanel>
        <PanelHeading title="收益经验曲线" description="按日期汇总收入，查看累计经验走势。" />
        <RevenueCurve data={data.revenueCurve} />
      </AdminPanel>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {items.map(([label, value]) => (
          <AdminPanel key={label}>
            <div className="text-sm text-[var(--neko-muted)]">{label}</div>
            <div className="mt-3 truncate text-2xl font-black text-[var(--neko-ink)] md:text-3xl">{value}</div>
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
