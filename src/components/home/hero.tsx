import Link from 'next/link';
import type { ReactNode } from 'react';
import { Activity, CalendarDays, Coins, Flag, FolderKanban, Target } from 'lucide-react';

import type { AwaitedReturn } from '@/types/common';
import { formatCompactCurrency, formatCurrency, formatPercent } from '@/lib/utils/format';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type DashboardData = AwaitedReturn<typeof import('@/lib/data/queries').getDashboardData>;

export function Hero({ data }: { data: DashboardData }) {
  const { settings, summary } = data;
  const dailyTarget = summary.gapToGoal / Math.max(settings.total_days - summary.currentDay + 1, 1);

  return (
    <section className="page-shell grid gap-6 py-8 lg:grid-cols-[1.24fr_0.76fr] lg:py-12">
      <div className="legacy-gradient relative overflow-hidden rounded-[28px] px-7 py-8 text-white shadow-[0_30px_80px_rgba(102,126,234,0.26)] md:px-10 md:py-11">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_28%),radial-gradient(circle_at_left,rgba(255,184,77,0.22),transparent_32%)]" />
        <div className="relative flex flex-col gap-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/18 bg-white/12 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/80">
            <Flag size={14} /> 公开实盘挑战
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="serif-heading text-4xl leading-tight md:text-6xl">
              1个人的赚钱赎身记：
              <br />
              1000天，赚到1000万。
            </h1>
            <p className="max-w-2xl text-base leading-8 text-white/78 md:text-lg">
              这不是课程包装页，而是每天记录项目、任务、收入和复盘的实盘系统。游客看进度和标题，会员看文章正文，后台只服务每天少量录入。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <MetricBox icon={<Target size={20} />} label="总目标" value={formatCompactCurrency(settings.total_target)} muted="1000天终局" />
            <MetricBox icon={<CalendarDays size={20} />} label="当前天数" value={`第 ${summary.currentDay} 天`} muted={`起始 ${settings.start_date}`} />
            <MetricBox icon={<Coins size={20} />} label="累计收入" value={formatCurrency(summary.totalRevenue)} muted={`今日 ${formatCurrency(summary.todayRevenue)}`} />
            <MetricBox icon={<FolderKanban size={20} />} label="活跃项目" value={`${summary.activeProjects} 个`} muted="并行收入来源" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/articles">
              <Button className="bg-[var(--highlight)] text-[#252038] hover:bg-[#ffc86f]">查看最新文章</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/16">
                注册 / 登录会员
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Card className="soft-grid flex flex-col justify-between gap-6 overflow-hidden rounded-[28px] bg-white/90">
        <div>
          <div className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">Goal Snapshot</div>
          <h2 className="serif-heading mt-3 text-3xl text-[var(--foreground)]">目标、进度、缺口，一屏看懂。</h2>
        </div>

        <div className="grid gap-4">
          <ProgressMetric label="收入进度" value={formatPercent(summary.incomeProgress)} percent={summary.incomeProgress} />
          <ProgressMetric label="时间进度" value={formatPercent(summary.timeProgress)} percent={summary.timeProgress} />
          <CompactMetric icon={<Activity size={17} />} label="剩余缺口" value={formatCurrency(summary.gapToGoal)} />
          <CompactMetric icon={<Coins size={17} />} label="剩余日均目标" value={formatCurrency(dailyTarget)} muted="按剩余天数倒推需要达到的每日收入" />
        </div>

        <div className="rounded-[24px] border border-[var(--border)] bg-white/72 p-4">
          <div className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Positioning</div>
          <p className="text-sm leading-7 text-[var(--foreground)]/80">
            第一版不追求复杂，核心是把每天发生的收入、任务完成情况和复盘文章沉淀下来，让长期挑战有连续记录。
          </p>
        </div>
      </Card>
    </section>
  );
}

function MetricBox({ icon, label, value, muted }: { icon: ReactNode; label: string; value: string; muted: string }) {
  return (
    <div className="rounded-[22px] border border-white/12 bg-white/10 px-4 py-5 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/68">{icon}{label}</div>
      <div className="mt-3 break-words text-2xl font-semibold leading-tight">{value}</div>
      <div className="mt-2 text-sm text-white/62">{muted}</div>
    </div>
  );
}

function CompactMetric({ icon, label, value, muted }: { icon: ReactNode; label: string; value: string; muted?: string }) {
  return (
    <div className="rounded-[18px] border border-[var(--border)] bg-white/74 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm text-[var(--muted)]">{icon}{label}</span>
        <span className="text-base font-semibold text-[var(--foreground)]">{value}</span>
      </div>
      {muted ? <div className="mt-2 text-xs leading-5 text-[var(--muted)]">{muted}</div> : null}
    </div>
  );
}

function ProgressMetric({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <div className="rounded-[20px] border border-[var(--border)] bg-white/74 px-4 py-4">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="text-[var(--muted)]">{label}</span>
        <span className="font-semibold text-[var(--foreground)]">{value}</span>
      </div>
      <div className="legacy-progress">
        <span style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
      </div>
    </div>
  );
}
