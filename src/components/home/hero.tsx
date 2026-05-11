import Link from 'next/link';

import type { AwaitedReturn } from '@/types/common';
import { formatCurrency, formatPercent } from '@/lib/utils/format';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type DashboardData = AwaitedReturn<typeof import('@/lib/data/queries').getDashboardData>;

export function Hero({ data }: { data: DashboardData }) {
  const { settings, summary } = data;

  return (
    <section className="page-shell grid gap-6 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:py-14">
      <div className="relative overflow-hidden rounded-[36px] border border-[var(--border)] bg-[linear-gradient(135deg,#0d5d4f_0%,#123328_58%,#1f231c_100%)] px-7 py-8 text-white shadow-[0_35px_80px_rgba(16,52,44,0.18)] md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(219,143,47,0.28),transparent_26%),radial-gradient(circle_at_left,rgba(255,255,255,0.08),transparent_32%)]" />
        <div className="relative flex flex-col gap-8">
          <div className="inline-flex w-fit items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/70">
            Public Challenge Journal
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="serif-heading text-4xl leading-tight md:text-6xl">
              一个真实的长期实验：
              <br />
              1000天，做到1000万。
            </h1>
            <p className="max-w-2xl text-base leading-8 text-white/78 md:text-lg">
              这里公开记录每天的推进、判断、收入和复盘。前台给外界看清方向，后台帮我把项目、任务、文章和每日收入收在同一套系统里。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <MetricBox label="起始日期" value={settings.start_date} muted="长期挑战正式开始" />
            <MetricBox label="当前天数" value={`第 ${summary.currentDay} 天`} muted="每天都算数" />
            <MetricBox label="累计收入" value={formatCurrency(summary.totalRevenue)} muted={`总目标 ${formatCurrency(settings.total_target)}`} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/articles">
              <Button className="bg-[var(--highlight)] text-[#1f221f] hover:bg-[#ebb05b]">查看最新文章</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/16">
                注册 / 登录会员
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Card className="soft-grid flex flex-col justify-between gap-6 overflow-hidden rounded-[36px] bg-[linear-gradient(180deg,rgba(255,250,242,0.92),rgba(255,255,255,0.74))]">
        <div>
          <div className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">Goal Snapshot</div>
          <h2 className="serif-heading mt-3 text-3xl text-[var(--foreground)]">前台只放真正重要的数字。</h2>
        </div>

        <div className="grid gap-4">
          <CompactMetric label="总目标进度" value={formatPercent(summary.incomeProgress)} />
          <CompactMetric label="时间进度" value={formatPercent(summary.timeProgress)} />
          <CompactMetric label="今日收入" value={formatCurrency(summary.todayRevenue)} />
          <CompactMetric label="活跃项目" value={`${summary.activeProjects} 个`} />
          <CompactMetric label="距离目标" value={formatCurrency(summary.gapToGoal)} />
        </div>

        <div className="rounded-[28px] border border-[var(--border)] bg-white/65 p-4">
          <div className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Positioning</div>
          <p className="text-sm leading-7 text-[var(--foreground)]/80">
            游客先看到目标、阶段和公开文章摘要；会员登录后再查看正文。页面后续可以按模块逐步放开，不必第一版把所有后台信息都暴露出来。
          </p>
        </div>
      </Card>
    </section>
  );
}

function MetricBox({ label, value, muted }: { label: string; value: string; muted: string }) {
  return (
    <div className="rounded-[28px] border border-white/12 bg-white/8 px-4 py-5 backdrop-blur-sm">
      <div className="text-xs uppercase tracking-[0.16em] text-white/58">{label}</div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
      <div className="mt-2 text-sm text-white/62">{muted}</div>
    </div>
  );
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[20px] border border-[var(--border)] bg-white/70 px-4 py-4">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span className="text-base font-semibold text-[var(--foreground)]">{value}</span>
    </div>
  );
}
