import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BookOpen, Clock3, Compass, FolderKanban, PawPrint, Plus, Settings, Sparkles, Target, UserRound, Zap } from 'lucide-react';

import { incrementHomeVital } from '@/app/actions';
import { normalizeHomeMood } from '@/lib/home/state';
import { clampPercent, formatCompactCurrency, formatCurrency, formatPercent } from '@/lib/utils/format';
import type { AwaitedReturn } from '@/types/common';

type DashboardData = AwaitedReturn<typeof import('@/lib/data/queries').getDashboardData>;

const vitalItems = [
  { key: 'share', label: '状态分享', hint: '把今天想说的话留下来' },
  { key: 'food', label: '饮食', hint: '吃到一顿舒服的饭也算进展' },
  { key: 'health', label: '健康', hint: '休息、运动、喝水都算照顾自己' },
  { key: 'energy', label: '活力', hint: '哪怕只推进一点，也是在回血' },
] as const;

export function Hero({ data }: { data: DashboardData }) {
  const { homeStatus, posts, projectTotals, settings, summary, viewer, viewerVitals } = data;
  const memoryCount = posts.length;
  const remainingDays = Math.max(settings.total_days - summary.currentDay, 0);
  const projectActivity = projectTotals.length > 0 ? clampPercent((summary.activeProjects / projectTotals.length) * 100) : 0;
  const mood = normalizeHomeMood(homeStatus.mood);
  const moodStyle = getMoodStyle(mood);
  const liveTime = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
  const todayLabel = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date());
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Shanghai',
      hour: '2-digit',
      hour12: false,
    }).format(new Date()),
  );
  const dayGreeting = hour < 11 ? '早安' : hour < 18 ? '下午好' : '晚上好';

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
        <Link href="/app/today" aria-label="进入今日行动" className="hidden h-11 w-11 items-center justify-center rounded-full border border-[var(--neko-line)] bg-white/75 text-[var(--neko-brown)] shadow-sm transition hover:-translate-y-0.5 hover:bg-white md:flex">
          <Settings size={22} />
        </Link>
      </div>

      <div className="relative px-5 pb-8 pt-5 md:px-10 lg:px-16">
        <div className="mx-auto flex w-fit flex-wrap items-center justify-center gap-x-7 gap-y-3 rounded-full border border-[var(--neko-line)] bg-white/72 px-6 py-4 text-sm font-bold text-[var(--neko-brown)] shadow-[0_10px_34px_rgba(99,65,54,0.08)] backdrop-blur-md md:text-base">
          <StatusDot tone="green" label="收入引擎已加载" />
          <StatusDot tone="rose" label="复盘在线" />
          <StatusDot tone="green" label="挑战在线" />
          <span className="flex items-center gap-2 text-[var(--neko-muted)]"><Clock3 size={18} /> {liveTime}</span>
          <MoodChip mood={mood} style={moodStyle} compact />
        </div>

        <div className="grid gap-6 pt-10 lg:grid-cols-[340px_minmax(360px,1fr)_340px] lg:items-start">
          <aside className="space-y-6">
            <Panel className="min-h-[320px]">
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
              <p className="mt-7 max-w-[240px] text-lg leading-9 text-[var(--neko-brown)]">
                今天只做三件事：记收入、勾任务、写复盘。Lumia 会把它们变成挑战进度。
              </p>
            </Panel>
          </aside>

          <div className="relative order-first flex min-h-[520px] items-start justify-center md:min-h-[720px] lg:order-none lg:min-h-[860px]">
            <div className="neko-room-glow" />
            <div className="absolute top-8 h-[660px] w-[660px] rounded-full bg-[radial-gradient(circle,rgba(255,227,196,0.48),rgba(255,246,239,0)_64%)]" />
            <Image
              src="/assets/companion-lumia-stage-cutout.png"
              alt="Lumia 养成伙伴"
              width={430}
              height={1060}
              unoptimized
              priority
              className="neko-avatar relative z-10 mt-2 h-[580px] w-auto max-w-[82vw] object-contain md:h-[820px] lg:h-[860px]"
            />
          </div>

          <aside className="space-y-6">
            <Panel className="min-h-[320px]">
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
          </aside>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          <Panel>
            <div className="text-sm font-black uppercase tracking-[0.18em] text-[var(--neko-muted)]">Today Mood</div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <MoodChip mood={mood} style={moodStyle} />
              <span className="rounded-full border border-[var(--neko-line)] bg-white/74 px-3 py-2 text-sm font-bold text-[var(--neko-brown)]">
                {homeStatus.todayString}
              </span>
            </div>
            <div className="mt-5 text-3xl font-black leading-tight text-[var(--neko-ink)]">
              {dayGreeting}，
              <br />
              今天也先和自己站在一边。
            </div>
            <p className="mt-4 text-base leading-8 text-[var(--neko-brown)]">{getMoodCopy(mood)}</p>
            <div className="mt-5 text-sm text-[var(--neko-muted)]">
              {todayLabel} · {homeStatus.tagline}
            </div>
          </Panel>

          <Panel>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-black uppercase tracking-[0.18em] text-[var(--neko-muted)]">Daily Check-In</div>
                <div className="mt-3 text-2xl font-black text-[var(--neko-ink)]">
                  {viewer?.displayName ?? viewer?.email?.split('@')[0] ?? '今天的状态补给'}
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--neko-brown)]">
                  {viewer ? '每点一次 +，都会给你今天的状态记上一格。' : '登录后可以给今天的状态、饮食、健康和活力逐项 +1。'}
                </p>
              </div>
              <span className="rounded-full bg-[#fff3e4] px-3 py-2 text-sm font-black text-[#d98a2b]">
                {viewer ? '已登录' : '未登录'}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {vitalItems.map((item) => (
                <VitalRow
                  key={item.key}
                  label={item.label}
                  hint={item.hint}
                  metric={item.key}
                  value={viewerVitals?.[item.key] ?? 0}
                  enabled={Boolean(viewer)}
                />
              ))}
            </div>
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
            <RhythmRow label="复盘记录" value={`${memoryCount} 篇`} />
          </Panel>
        </div>

        <Panel className="mt-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.18em] text-[var(--neko-muted)]">Quick Actions</div>
              <div className="mt-2 text-2xl font-black text-[var(--neko-ink)]">今天先从最小的一步开始</div>
            </div>
            <Link href="/app/today?tab=tasks" className="hidden rounded-full border border-[var(--neko-line)] bg-white/78 px-4 py-2 text-sm font-black text-[var(--neko-brown)] transition hover:bg-white md:inline-flex">
              进入今日录入
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <QuickAction href="/app/today?tab=tasks" icon={<Sparkles size={24} />} title="今日录入" subtitle="任务 / 收入 / 复盘" tone="rose" />
            <QuickAction href="/articles" icon={<BookOpen size={24} />} title="每日复盘" subtitle={`${memoryCount} 篇记录`} tone="orange" />
            <QuickAction href="/app/projects" icon={<FolderKanban size={24} />} title="项目看板" subtitle={`${summary.activeProjects} 个进行中`} tone="green" />
          </div>
        </Panel>

        <div className="relative z-20 mx-auto mt-6 max-w-[1088px]">
          <nav className="neko-dock">
            <DockItem href="/" icon={<PawPrint size={31} />} label="首页" active />
            <DockItem href="/app/progress" icon={<Target size={31} />} label="进度" />
            <DockItem href="/app/projects" icon={<Compass size={31} />} label="项目" />
            <DockItem href="/articles" icon={<BookOpen size={31} />} label="复盘" />
            <DockItem href="/app/today?tab=tasks" icon={<Zap size={31} />} label="录入" />
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

function MoodChip({
  mood,
  style,
  compact = false,
}: {
  mood: string;
  style: { text: string; dot: string; surface: string };
  compact?: boolean;
}) {
  return (
    <span
      data-testid={compact ? 'home-mood-chip-compact' : 'home-mood-chip'}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-black ${style.surface} ${style.text} ${compact ? 'text-sm' : 'text-base'}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
      当前精神状态：{mood}
    </span>
  );
}

function VitalRow({
  enabled,
  hint,
  label,
  metric,
  value,
}: {
  enabled: boolean;
  hint: string;
  label: string;
  metric: (typeof vitalItems)[number]['key'];
  value: number;
}) {
  return (
    <div data-testid={`home-vital-${metric}`} className="flex items-center gap-3 rounded-[24px] border border-[var(--neko-line)] bg-white/68 px-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="text-base font-black text-[var(--neko-ink)]">{label}</div>
        <div className="mt-1 text-sm text-[var(--neko-muted)]">{hint}</div>
      </div>

      <div className="flex items-center gap-2">
        <span data-testid={`home-vital-${metric}-value`} className="inline-flex min-w-[56px] items-center justify-center rounded-full border border-[var(--neko-line)] bg-white/84 px-3 py-2 text-lg font-black text-[var(--neko-ink)]">
          {value}
        </span>
        {enabled ? (
          <form action={incrementHomeVital}>
            <input type="hidden" name="metric" value={metric} />
            <button
              type="submit"
              data-testid={`home-vital-${metric}-button`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--neko-red)] text-white shadow-[0_12px_28px_rgba(201,101,113,0.24)] transition hover:-translate-y-0.5 hover:bg-[#b95766]"
              aria-label={`增加${label}`}
            >
              <Plus size={18} />
            </button>
          </form>
        ) : (
          <Link
            href="/login?next=/"
            data-testid={`home-vital-${metric}-button`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--neko-line)] bg-white/84 text-[var(--neko-brown)] transition hover:bg-white"
            aria-label={`登录后记录${label}`}
          >
            <Plus size={18} />
          </Link>
        )}
      </div>
    </div>
  );
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
      <strong className="text-right text-[#111418]">{value}</strong>
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

function QuickAction({
  href,
  icon,
  subtitle,
  title,
  tone,
}: {
  href: string;
  icon: ReactNode;
  subtitle: string;
  title: string;
  tone: 'rose' | 'orange' | 'green';
}) {
  const tones = {
    rose: 'bg-[#f7dfe4] text-[var(--neko-red)]',
    orange: 'bg-[#fff0de] text-[#e28e32]',
    green: 'bg-[#e3f3ec] text-[#42b485]',
  };

  return (
    <Link href={href} className="flex min-h-[136px] flex-col justify-between rounded-[26px] border border-[var(--neko-line)] bg-white/68 p-5 transition hover:-translate-y-1 hover:bg-white">
      <span className={`flex h-14 w-14 items-center justify-center rounded-full ${tones[tone]}`}>{icon}</span>
      <span className="mt-5 block">
        <span className="block text-xl font-black text-[#111418]">{title}</span>
        <span className="mt-2 block text-sm text-[var(--neko-muted)]">{subtitle}</span>
      </span>
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

function getMoodCopy(mood: string) {
  switch (mood) {
    case '开心':
      return '开心的时候就把这股顺手的劲留住，今天再推进一小步，会比昨天更亮。';
    case '乐观':
      return '你今天的底色偏亮，先别急着怀疑自己，把眼前这一段路踏稳就够了。';
    case '焦虑':
      return '不用一次把所有事都想明白，先完成最小的一步，心会慢慢落下来。';
    case '沮丧':
      return '低落不是退步，只是暂时有点累。今天先照顾好自己，再去碰世界。';
    case '痛苦':
      return '今天能撑住、能呼吸、能完成一点点，就已经很不容易了，Lumia 会陪着你。';
    default:
      return '先慢一点也没关系，把今天过稳，把最小的动作做完，情绪就会有落点。';
  }
}

function getMoodStyle(mood: string) {
  switch (mood) {
    case '开心':
      return {
        surface: 'border-[#ffd2a8] bg-[#fff1df]',
        text: 'text-[#cf7e25]',
        dot: 'bg-[#f4a547]',
      };
    case '乐观':
      return {
        surface: 'border-[#bfe1cf] bg-[#edf8f2]',
        text: 'text-[#3d986f]',
        dot: 'bg-[#4abc91]',
      };
    case '焦虑':
      return {
        surface: 'border-[#f1cccf] bg-[#fff3f3]',
        text: 'text-[#c26c75]',
        dot: 'bg-[#d88189]',
      };
    case '沮丧':
      return {
        surface: 'border-[#d9d4e7] bg-[#f4f1fa]',
        text: 'text-[#7d6ea8]',
        dot: 'bg-[#9f8dc9]',
      };
    case '痛苦':
      return {
        surface: 'border-[#dfcfc6] bg-[#f7efea]',
        text: 'text-[#9f6656]',
        dot: 'bg-[#bf7f6c]',
      };
    default:
      return {
        surface: 'border-[var(--neko-line)] bg-white/76',
        text: 'text-[var(--neko-brown)]',
        dot: 'bg-[var(--neko-red)]',
      };
  }
}
