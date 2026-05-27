import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { Clock3, Compass, MessageCircle, Mic, PawPrint, Send, Settings, Sparkles, Star, UserRound, Zap } from 'lucide-react';

import type { AwaitedReturn } from '@/types/common';
import { clampPercent } from '@/lib/utils/format';

type DashboardData = AwaitedReturn<typeof import('@/lib/data/queries').getDashboardData>;

export function Hero({ data }: { data: DashboardData }) {
  const { summary, posts, projectTotals } = data;
  const memoryCount = posts.length;
  const companionLevel = Math.max(1, Math.round(summary.currentDay / 7));
  const intimacy = clampPercent(Math.max(summary.incomeProgress * 2.4, summary.timeProgress * 0.76, memoryCount * 12));
  const stamina = clampPercent(Math.max(18, 100 - summary.timeProgress * 0.42));
  const focus = clampPercent(Math.max(20, summary.incomeProgress + summary.timeProgress * 0.6));
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
          OpenTiaotiao Engine
        </Link>
        <Link href="/app/today" aria-label="进入后台设置" className="hidden h-11 w-11 items-center justify-center rounded-full border border-[var(--neko-line)] bg-white/75 text-[var(--neko-brown)] shadow-sm transition hover:-translate-y-0.5 hover:bg-white md:flex">
          <Settings size={22} />
        </Link>
      </div>

      <div className="relative px-5 pb-8 pt-5 md:px-10 lg:px-16">
        <div className="mx-auto flex w-fit flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-full border border-[var(--neko-line)] bg-white/72 px-7 py-4 text-sm font-bold text-[var(--neko-brown)] shadow-[0_10px_34px_rgba(99,65,54,0.08)] backdrop-blur-md md:text-xl">
          <StatusDot tone="green" label="Live2D 已加载" />
          <StatusDot tone="rose" label="专注" />
          <StatusDot tone="green" label="挑战在线" />
          <span className="flex items-center gap-2 text-[var(--neko-muted)]"><Clock3 size={20} /> {liveTime}</span>
        </div>

        <div className="grid min-h-[980px] gap-6 pt-10 lg:grid-cols-[340px_minmax(360px,1fr)_312px] lg:items-start xl:min-h-[1080px]">
          <aside className="z-10 space-y-6">
            <Panel className="min-h-[310px]">
              <div className="text-lg font-bold text-[var(--neko-ink)]">
                第 {summary.currentDay} 天 <span className="ml-3 text-[var(--neko-red)]">成长晴朗</span>
              </div>
              <h1 className="mt-7 text-3xl font-black leading-tight tracking-normal text-[#151719] md:text-4xl">
                晚上好
                <br />
                Tiaotiao
                <br />
                Lumia
              </h1>
              <p className="mt-7 max-w-[220px] text-lg leading-9 text-[var(--neko-brown)]">
                今天要不要一起把收入、任务和复盘都喂给成长引擎？
              </p>
            </Panel>

            <Panel>
              <h2 className="mb-6 text-xl font-bold text-[var(--neko-ink)]">身体状态</h2>
              <CareBar label="饱食" value={intimacy} color="green" />
              <CareBar label="水分" value={stamina} color="red" />
              <CareBar label="活力" value={focus} color="orange" />
            </Panel>

            <Panel>
              <h2 className="mb-5 text-xl font-bold text-[var(--neko-ink)]">关系节奏</h2>
              <RhythmRow label="记忆数" value={`${memoryCount}`} />
              <RhythmRow label="项目羁绊" value={`${projectTotals.length}`} />
              <RhythmRow label="伙伴等级" value={`Lv.${companionLevel}`} />
            </Panel>
          </aside>

          <div className="relative order-first flex min-h-[720px] items-start justify-center lg:order-none lg:min-h-[1010px]">
            <div className="neko-room-glow" />
            <div className="absolute top-8 h-[660px] w-[660px] rounded-full bg-[radial-gradient(circle,rgba(255,227,196,0.48),rgba(255,246,239,0)_64%)]" />
            <Image
              src="/assets/companion-lumia-stage-cutout.png"
              alt="Lumia 养成伙伴"
              width={430}
              height={1060}
              unoptimized
              priority
              className="neko-avatar relative z-10 mt-2 h-[720px] w-auto max-w-[82vw] object-contain md:h-[860px] lg:h-[980px]"
            />
          </div>

          <aside className="z-10 space-y-6">
            <Panel>
              <div className="text-lg font-bold text-[var(--neko-ink)]">
                LIVE STAGE <span className="ml-3 text-[var(--neko-red)]">运行中</span>
              </div>
              <h2 className="mt-6 text-2xl font-black leading-snug text-[#111418]">
                Lumia 在桌面
                <br />
                陪伴中
              </h2>
              <div className="mt-6 space-y-4">
                <StagePill dot="green" label="模型" value="Live2D" />
                <StagePill dot="rose" label="心情" value="开心" />
                <StagePill dot="orange" label="互动" value={`${summary.activeProjects + memoryCount}`} />
              </div>
            </Panel>

            <Panel>
              <h2 className="mb-5 text-xl font-bold text-[var(--neko-ink)]">快捷动作</h2>
              <QuickAction href="/articles" icon={<MessageCircle size={25} />} title="去对话" subtitle="读复盘..." tone="rose" />
              <QuickAction href="/articles" icon={<Star size={27} />} title="查记忆" subtitle="看文章..." tone="orange" />
              <QuickAction href="/app/today" icon={<Sparkles size={25} />} title="同步..." subtitle="今日录入..." tone="green" />
            </Panel>
          </aside>
        </div>

        <div className="relative z-20 mx-auto mt-6 max-w-[1088px] space-y-8">
          <div className="neko-inputbar">
            <span className="min-w-0 flex-1 truncate px-2 text-xl text-[var(--neko-muted)] md:text-2xl">跟 Lumia 说点什么...</span>
            <Link href="/login" aria-label="登录语音入口" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--neko-line)] bg-white text-[var(--neko-brown)] shadow-sm md:h-16 md:w-16">
              <Mic size={28} />
            </Link>
            <Link href="/articles" aria-label="发送并查看记忆" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--neko-red)] text-white shadow-[0_14px_28px_rgba(197,99,111,0.34)] md:h-[72px] md:w-[72px]">
              <Send size={30} />
            </Link>
          </div>

          <nav className="neko-dock">
            <DockItem href="/" icon={<PawPrint size={31} />} label="陪伴" active />
            <DockItem href="/articles" icon={<MessageCircle size={31} />} label="对话" />
            <DockItem href="/articles" icon={<Star size={31} />} label="记忆" />
            <DockItem href="/app/projects" icon={<Compass size={31} />} label="世界" />
            <DockItem href="/app/today" icon={<Zap size={31} />} label="Agent" />
            <DockItem href="/register" icon={<UserRound size={31} />} label="我的" />
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
        <strong className="text-[#111418]">{Math.round(value)}%</strong>
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
