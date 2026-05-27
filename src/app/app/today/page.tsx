import Link from 'next/link';
import type { ReactNode } from 'react';
import { CalendarCheck, CheckCircle2, Coins, FileText } from 'lucide-react';

import { AdminPanel } from '@/components/app/admin-ui';
import { TodayIncomeForm, TodayPostForm, TodayTaskList } from '@/components/app/forms';
import { getTodayConsoleData } from '@/lib/data/queries';
import { formatCurrency, formatPercent } from '@/lib/utils/format';

type TodayTab = 'income' | 'review' | 'tasks';

const todayTabs = [
  { id: 'tasks' as TodayTab, label: '任务打卡', hint: '执行力', icon: CheckCircle2 },
  { id: 'income' as TodayTab, label: '收入登记', hint: '经验值', icon: Coins },
  { id: 'review' as TodayTab, label: '复盘文档', hint: '记忆卡', icon: FileText },
];

export default async function TodayPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const params = await searchParams;
  const requestedTab = typeof params.tab === 'string' ? params.tab : 'tasks';
  const activeTab: TodayTab = todayTabs.some((tab) => tab.id === requestedTab) ? (requestedTab as TodayTab) : 'tasks';
  const data = await getTodayConsoleData();

  return (
    <div className="space-y-5">
      <section className="legacy-gradient relative overflow-hidden rounded-[32px] px-5 py-7 text-white shadow-[0_24px_70px_rgba(201,101,113,0.2)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_28%)]" />
        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="mb-3 inline-flex rounded-full border border-white/18 bg-white/12 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/78">
              Day {data.summary.currentDay} · {data.summary.todayString}
            </div>
            <h1 className="text-4xl font-black leading-tight">今日养成行动</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/76">
              每天只做三件事：收入投喂、任务打卡、复盘存档。其它进度由系统自动同步。
            </p>
          </div>
          <div className="rounded-[22px] border border-white/16 bg-white/12 px-5 py-4 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.16em] text-white/64">累计收入</div>
            <div className="mt-2 text-3xl font-semibold">{formatCurrency(data.summary.totalRevenue)}</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <ConsoleStat icon={<Coins size={20} />} label="今日收入" value={formatCurrency(data.summary.todayRevenue)} muted={`${data.todayIncomeRecords.length} 条记录`} />
        <ConsoleStat icon={<CheckCircle2 size={20} />} label="任务完成" value={`${data.summary.completedTasks}/${data.summary.totalTasks}`} muted={formatPercent(data.summary.taskCompletionRate)} />
        <ConsoleStat icon={<CalendarCheck size={20} />} label="未完成任务" value={`${data.summary.pendingTasks} 项`} muted="晚上复盘前清掉" />
        <ConsoleStat icon={<FileText size={20} />} label="最新文章" value={data.posts[0]?.title ?? '未发布'} muted="写完后前台展示标题" />
      </div>

      <nav className="grid grid-cols-3 gap-2 rounded-[28px] border border-[var(--neko-line)] bg-white/78 p-2 shadow-[0_14px_38px_rgba(93,65,57,0.08)] backdrop-blur-xl">
        {todayTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;

          return (
            <Link
              key={tab.id}
              href={`/app/today?tab=${tab.id}`}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-[22px] px-2 py-3 text-center transition ${
                isActive ? 'bg-[#f7dfe4] text-[var(--neko-red)]' : 'text-[var(--neko-brown)] hover:bg-white/74'
              }`}
            >
              <Icon size={22} />
              <span className="truncate text-sm font-black">{tab.label}</span>
              <span className="hidden text-[11px] font-bold opacity-70 sm:block">{tab.hint}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-auto w-full max-w-[620px]">
        {activeTab === 'income' ? <TodayIncomeForm projects={data.projects} /> : null}
        {activeTab === 'review' ? <TodayPostForm /> : null}
        {activeTab === 'tasks' ? <TodayTaskList tasks={data.tasks} /> : null}
      </div>
    </div>
  );
}

function ConsoleStat({ icon, label, value, muted }: { icon: ReactNode; label: string; value: string; muted: string }) {
  return (
    <AdminPanel>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7dfe4] text-[var(--neko-red)]">{icon}</div>
      <div className="text-sm text-[var(--neko-muted)]">{label}</div>
      <div className="mt-2 truncate text-2xl font-black text-[var(--neko-ink)]">{value}</div>
      <div className="mt-2 truncate text-xs text-[var(--neko-muted)]">{muted}</div>
    </AdminPanel>
  );
}
