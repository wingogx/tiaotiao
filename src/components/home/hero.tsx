import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { BookOpen, Clock3, Compass, FolderKanban, Mic, PawPrint, Send, Settings, Sparkles, Target, UserRound, Zap } from 'lucide-react';

import type { AwaitedReturn } from '@/types/common';
import { clampPercent, formatCompactCurrency, formatCurrency, formatPercent } from '@/lib/utils/format';

type DashboardData = AwaitedReturn<typeof import('@/lib/data/queries').getDashboardData>;

export function Hero({ data }: { data: DashboardData }) {
  const { settings, summary, posts, projectTotals } = data;
  const memoryCount = posts.length;
  const remainingDays = Math.max(settings.total_days - summary.currentDay, 0);
  const projectActivity = projectTotals.length > 0 ? clampPercent((summary.activeProjects / projectTotals.length) * 100) : 0;
  const liveTime = new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());

  return (
    <section className="neko-screen mx-auto mt-0 min-h-screen max-w-[1360px] overflow-hidden rounded-b-[28px] border border-[var(--neko-line)] bg-[var(--neko-bg)] shadow-[0_28px_90px_rgba(83,58,48,0.14)]">
      <div className="neko-titlebar">
        <div className="flex items-center gap-3">
          <span className="neko-traffic bg-[#ff5b63]" />
          <span className="neko-traffic bg-[#f6bd2d]" />
          <span className="neko-traffic bg-[#35c568]" />
        </div>
        <Link href="/" className="min-w-0 justify-self-center truncate text-center text-lg font-bold text-[var(--neko-ink-soft)] md:text-2xl">
          1000天实盘挑战舱
        </Link>
        <Link href="/app/today" aria-label="进入后台设置" className="hidden h-11 w-11 items-center justify-center rounded-full border border-[var(--neko-line)] bg-white/75 text-[var(--neko-brown)] shadow-sm transition hover:-translate-y-0.5 hover:bg-white md:flex">
          <Settings size={22} />
        </Link>
      </div>

      <div className="relative px-5 pb-8 pt-5 md:px-10 lg:px-16">
        <div className="mx-auto flex w-fit flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-full border border-[var(--neko-line)] bg-white/72 px-7 py-4 text-sm font-bold text-[var(--neko-brown)] shadow-[0_10px_34px_rgba(99,65,54,0.08)] backdrop-blur-md md:text-xl">
          <StatusDot tone="green" label="收入引擎已加载" />
          <StatusDot tone="rose" label="复盘在线" />
          <StatusDot tone="green" label="挑战在线" />
          <span className="flex items-center gap-2 text-[var(--neko-muted)]"><Clock3 size={20} /> {liveTime}</span>
        </div>

        <div className="grid min-h-[980px] gap-6 pt-10 lg:grid-cols-[340px_minmax(360px,1fr)_312px] lg:items-start xl:min-h-[1080px]">
          <aside className="z-10 space-y-6">
            <Panel className="min-h-[310px]">
              <div className="text-lg font-bold text-[var(--neko-ink)]">
                第 {summary.currentDay} 天 <span className="ml-3 text-[var(--neko-red)]">实盘记录中</span>
              </div>
              <h1 className="mt-7 text-3xl font-black leading-tight tracking-normal text-[#151719] md:text-4xl">
                1000天
                <br />
                赚到
                <br />
                1000万
              </h1>
              <p className="mt-7 max-w-[220px] text-lg leading-9 text-[var(--neko-brown)]">
                今天只做三件事：记收入、勾任务、写复盘。Lumia 会把它们变成挑战进度。
              </p>
            </Panel>

            <Panel>
              <h2 className="mb-6 text-xl font-bold text-[var(--neko-ink)]">挑战状态</h2>
              <CareBar label="收入进度" value={summary.incomeProgress} color="green" />
              <CareBar label="时间进度" value={summary.timeProgress} color="red" />
              <CareBar label="项目活跃" value={projectActivity} color="orange" />
            </Panel>

            <Panel>
              <h2 className="mb-5 text-xl font-bold text-[var(--neko-ink)]">今日账本</h2>
              <RhythmRow label="累计收入" value={formatCurrency(summary.totalRevenue)} />
              <RhythmRow label="今日收入" value={formatCurrency(summary.todayRevenue)} />
              <RhythmRow label="剩余天数" value={`${remainingDays} 天`} />
            </Panel>
          </aside>

          <div className="relative order-first flex min-h-[600px] items-start justify-center md:min-h-[720px] lg:order-none lg:min-h-[1010px]">
            <div className="neko-room-glow" />
            <div className="absolute top-8 h-[660px] w-[660px] rounded-full bg-[radial-gradient(circle,rgba(255,227,196,0.48),rgba(255,246,239,0)_64%)]" />
            <Image
              src="/assets/companion-lumia-stage-cutout.png"
              alt="Lumia 养成伙伴"
              width={430}
              height={1060}
              unoptimized
              priority
              className="neko-avatar relative z-10 mt-2 h-[600px] w-auto max-w-[82vw] object-contain md:h-[860px] lg:h-[980px]"
            />
          </div>

          <aside className="z-10 space-y-6">
            <Panel>
              <div className="text-lg font-bold text-[var(--neko-ink)]">
                1000 DAY STAGE <span className="ml-3 text-[var(--neko-red)]">运行中</span>
              </div>
              <h2 className="mt-6 text-2xl font-black leading-snug text-[#111418]">
                1000天赚1000万
                <br />
                实盘挑战
              </h2>
              <div className="mt-6 space-y-4">
                <StagePill dot="green" label="总目标" value={formatCompactCurrency(settings.total_target)} />
                <StagePill dot="rose" label="累计" value={formatCompactCurrency(summary.totalRevenue)} />
                <StagePill dot="orange" label="缺口" value={formatCompactCurrency(summary.gapToGoal)} />
              </div>
            </Panel>

            <Panel>
              <h2 className="mb-5 text-xl font-bold text-[var(--neko-ink)]">快捷动作</h2>
              <QuickAction href="/app/today" icon={<Sparkles size={25} />} title="今日录入" subtitle="收入 / 任务 / 复盘" tone="rose" />
              <QuickAction href="/articles" icon={<BookOpen size={27} />} title="每日复盘" subtitle={`${memoryCount} 篇记录`} tone="orange" />
              <QuickAction href="/app/projects" icon={<FolderKanban size={25} />} title="项目看板" subtitle={`${summary.activeProjects} 个进行中`} tone="green" />
            </Panel>
          </aside>
        </div>

        <div className="relative z-20 mx-auto mt-6 max-w-[1088px] space-y-8">
          <div className="neko-inputbar">
            <span className="min-w-0 flex-1 truncate px-2 text-xl text-[var(--neko-muted)] md:text-2xl">记录今天的收入 / 任务 / 复盘...</span>
            <Link href="/login" aria-label="登录语音入口" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--neko-line)] bg-white text-[var(--neko-brown)] shadow-sm md:h-16 md:w-16">
              <Mic size={28} />
            </Link>
            <Link href="/app/today" aria-label="进入今日录入" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--neko-red)] text-white shadow-[0_14px_28px_rgba(197,99,111,0.34)] md:h-[72px] md:w-[72px]">
              <Send size={30} />
            </Link>
          </div>

          <nav className="neko-dock">
            <DockItem href="/" icon={<PawPrint size={31} />} label="首页" active />
            <DockItem href="/articles" icon={<BookOpen size={31} />} label="复盘" />
            <DockItem href="/app/projects" icon={<Compass size={31} />} label="项目" />
            <DockItem href="/app/progress" icon={<Target size={31} />} label="进度" />
            <DockItem href="/app/today" icon={<Zap size={31} />} label="录入" />
            <DockItem href="/me" icon={<UserRound size={31} />} label="我的" />
          </nav>
        </div>
      </div>
    </section>
  );
}

function StatusDot({ tone, label }: { tone: 'green' | 'rose'; label: string }) {
  return (
    <span className="flex items-center gap-3">
      <span className={`h-3 w-3 rounded-full ${tone === 'green' ? 'bg-[#4abc91]' : 'bg-[var(--neko-red)]'}`} />
      {label}
    </span>
  );
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`neko-panel ${className}`}>{children}</div>;
}

function CareBar({ label, value, color }: { label: string; value: number; color: 'green' | 'red' | 'orange' }) {
  const colors = {
    green: 'bg-[#4abc91]',
    red: 'bg-[#f05262]',
    orange: 'bg-[#eea13d]',
  };

  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-3 flex items-center justify-between text-lg text-[var(--neko-brown)]">
        <span>{label}</span>
        <strong className="text-[#111418]">{formatPercent(value)}</strong>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#ded3cd]">
        <span className={`block h-full rounded-full ${colors[color]}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function RhythmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-lg">
      <span className="text-[var(--neko-brown)]">{label}</span>
      <strong className="text-[#111418]">{value}</strong>
    </div>
  );
}

function StagePill({ dot, label, value }: { dot: 'green' | 'rose' | 'orange'; label: string; value: string }) {
  const dotClass = dot === 'green' ? 'bg-[#4abc91]' : dot === 'rose' ? 'bg-[var(--neko-red)]' : 'bg-[#eea13d]';

  return (
    <div className="flex h-[58px] items-center justify-between rounded-[18px] border border-[var(--neko-line)] bg-white/62 px-5 text-lg">
      <span className="flex items-center gap-3 text-[var(--neko-brown)]">
        <span className={`h-3 w-3 rounded-full ${dotClass}`} />
        {label}
      </span>
      <strong className="text-[#111418]">{value}</strong>
    </div>
  );
}

function QuickAction({ href, icon, title, subtitle, tone }: { href: string; icon: ReactNode; title: string; subtitle: string; tone: 'rose' | 'orange' | 'green' }) {
  const tones = {
    rose: 'bg-[#f7dfe4] text-[var(--neko-red)]',
    orange: 'bg-[#fff0de] text-[#e28e32]',
    green: 'bg-[#e3f3ec] text-[#42b485]',
  };

  return (
    <Link href={href} className="mb-4 flex min-h-[98px] items-center gap-5 rounded-[24px] border border-[var(--neko-line)] bg-white/66 px-4 transition hover:-translate-y-1 hover:bg-white last:mb-0">
      <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xl font-black text-[#111418]">{title}</span>
        <span className="mt-1 block truncate text-base text-[var(--neko-muted)]">{subtitle}</span>
      </span>
      <span className="text-2xl text-[var(--neko-brown)]">›</span>
    </Link>
  );
}

function DockItem({ href, icon, label, active = false }: { href: string; icon: ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href} className={`flex min-w-[76px] flex-col items-center gap-2 text-base font-bold transition hover:-translate-y-1 ${active ? 'text-[var(--neko-red)]' : 'text-[var(--neko-brown)]'}`}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}
