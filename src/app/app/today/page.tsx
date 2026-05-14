import type { ReactNode } from 'react';
import { CalendarCheck, CheckCircle2, Coins, FileText } from 'lucide-react';

import { AdminPanel } from '@/components/app/admin-ui';
import { TodayIncomeForm, TodayPostForm, TodayTaskList } from '@/components/app/forms';
import { getTodayConsoleData } from '@/lib/data/queries';
import { formatCurrency, formatPercent } from '@/lib/utils/format';

export default async function TodayPage() {
  const data = await getTodayConsoleData();

  return (
    <div className="space-y-6">
      <section className="legacy-gradient relative overflow-hidden rounded-[28px] px-6 py-7 text-white shadow-[0_24px_70px_rgba(102,126,234,0.24)] md:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_28%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-3 inline-flex rounded-full border border-white/18 bg-white/12 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/78">
              Day {data.summary.currentDay} · {data.summary.todayString}
            </div>
            <h1 className="serif-heading text-4xl leading-tight">今日录入操作台</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/76">
              每天只处理三件事：登记收入、勾选任务、写复盘文章。其它统计自动同步到首页、项目看板、收入情况和完成进度。
            </p>
          </div>
          <div className="rounded-[22px] border border-white/16 bg-white/12 px-5 py-4 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.16em] text-white/64">累计收入</div>
            <div className="mt-2 text-3xl font-semibold">{formatCurrency(data.summary.totalRevenue)}</div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <ConsoleStat icon={<Coins size={20} />} label="今日收入" value={formatCurrency(data.summary.todayRevenue)} muted={`${data.todayIncomeRecords.length} 条记录`} />
        <ConsoleStat icon={<CheckCircle2 size={20} />} label="任务完成" value={`${data.summary.completedTasks}/${data.summary.totalTasks}`} muted={formatPercent(data.summary.taskCompletionRate)} />
        <ConsoleStat icon={<CalendarCheck size={20} />} label="未完成任务" value={`${data.summary.pendingTasks} 项`} muted="晚上复盘前清掉" />
        <ConsoleStat icon={<FileText size={20} />} label="最新文章" value={data.posts[0]?.title ?? '未发布'} muted="写完后前台展示标题" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <TodayIncomeForm projects={data.projects} />
          <TodayPostForm />
        </div>
        <TodayTaskList tasks={data.tasks} />
      </div>
    </div>
  );
}

function ConsoleStat({ icon, label, value, muted }: { icon: ReactNode; label: string; value: string; muted: string }) {
  return (
    <AdminPanel>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(102,126,234,0.1)] text-[var(--accent)]">{icon}</div>
      <div className="text-sm text-[var(--muted)]">{label}</div>
      <div className="mt-2 truncate text-2xl font-semibold text-[var(--foreground)]">{value}</div>
      <div className="mt-2 truncate text-xs text-[var(--muted)]">{muted}</div>
    </AdminPanel>
  );
}
