import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BookOpen, Clock3, Compass, HeartHandshake, Map, Mic, PawPrint, Plus, Send, Settings, Sparkles, Target, UserRound, Zap } from 'lucide-react';

import { addViewerReaction, incrementHomeVital } from '@/app/actions';
import { HomeVisitPill } from '@/components/home/home-visit-pill';
import { RiskNotice } from '@/components/common/risk-notice';
import { getIncomeTypeLabel } from '@/lib/data/queries';
import { normalizeHomeMood } from '@/lib/home/state';
import { clampPercent, formatCompactCurrency, formatCurrency, formatDate } from '@/lib/utils/format';
import type { AwaitedReturn } from '@/types/common';

type DashboardData = AwaitedReturn<typeof import('@/lib/data/queries').getDashboardData>;

const vitalItems = [
  { key: 'share', label: '状态分享', hint: '说一句今天的心事', bar: 'bg-[#4abc91]' },
  { key: 'food', label: '饮食', hint: '吃到一顿舒服的饭', bar: 'bg-[#f0a455]' },
  { key: 'health', label: '健康', hint: '把自己照顾好一点', bar: 'bg-[#df6f78]' },
  { key: 'energy', label: '活力', hint: '哪怕只推进一点点', bar: 'bg-[#f28d3a]' },
] as const;

export function Hero({ data }: { data: DashboardData }) {
  const { homeStatus, posts, settings, summary, viewer, viewerVitals } = data;
  const remainingDays = Math.max(settings.total_days - summary.currentDay, 0);
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
  const heroHeadline = getHeroHeadline(hour);
  const viewerName = viewer?.displayName ?? viewer?.email?.split('@')[0] ?? '你';
  const todayCareTotal = (viewerVitals?.share ?? 0) + (viewerVitals?.food ?? 0) + (viewerVitals?.health ?? 0) + (viewerVitals?.energy ?? 0);

  return (
    <section className="neko-screen mx-auto mt-0 min-h-screen max-w-[1360px] overflow-hidden rounded-b-[28px] border border-[var(--neko-line)] bg-[var(--neko-bg)] shadow-[0_28px_90px_rgba(83,58,48,0.14)]">
      <div className="neko-titlebar">
        <div className="flex items-center gap-3">
          <span className="neko-traffic bg-[#ff5b63]" />
          <span className="neko-traffic bg-[#f6bd2d]" />
          <span className="neko-traffic bg-[#35c568]" />
        </div>
        <Link href="/" className="min-w-0 justify-self-center truncate text-center text-lg font-bold text-[var(--neko-ink-soft)] md:text-2xl">
          1000天真实盈利养成记录
        </Link>
        <Link href="/app/today" aria-label="进入今日行动" className="hidden h-11 w-11 items-center justify-center rounded-full border border-[var(--neko-line)] bg-white/75 text-[var(--neko-brown)] shadow-sm transition hover:-translate-y-0.5 hover:bg-white md:flex">
          <Settings size={22} />
        </Link>
      </div>

      <div className="relative px-5 pb-8 pt-5 md:px-10 lg:px-14">
        <div className="mx-auto flex w-fit flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-full border border-[var(--neko-line)] bg-white/72 px-7 py-4 text-sm font-bold text-[var(--neko-brown)] shadow-[0_10px_34px_rgba(99,65,54,0.08)] backdrop-blur-md">
          <StatusDot tone="rose" label={mood} />
          <HomeVisitPill initialCount={homeStatus.visitCount} />
          <span className="flex items-center gap-2 text-[var(--neko-muted)]"><Clock3 size={18} /> {liveTime}</span>
        </div>

        <div className="grid min-h-[980px] gap-6 pt-8 lg:grid-cols-[292px_minmax(320px,1fr)_332px] xl:grid-cols-[312px_minmax(360px,1fr)_356px]">
          <aside className="z-10 flex flex-col gap-5 lg:pt-16">
            <Panel className="min-h-[232px]">
              <div className="flex items-center gap-3 text-sm font-bold text-[var(--neko-muted)]">
                <span className="rounded-full border border-[var(--neko-line)] bg-white/72 px-3 py-1">{todayLabel}</span>
                <span>{homeStatus.todayString}</span>
              </div>
              <h1 className="mt-5 text-[2rem] font-black leading-tight text-[#171414]">
                {heroHeadline}
                <br />
                Lumia
              </h1>
              <p className="mt-4 text-base leading-8 text-[var(--neko-brown)]">{getMoodCopy(mood)}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <MoodChip mood={mood} style={moodStyle} />
              </div>
            </Panel>

            <Panel>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-[var(--neko-ink)]">今天的状态</h2>
                  <p className="mt-1 text-sm text-[var(--neko-muted)]">
                    {viewer ? `${viewerName} 可以直接点 + 记录今天。` : '登录后可以给今天的四项状态逐一加分。'}
                  </p>
                </div>
                <span className="rounded-full bg-[#fff3e4] px-3 py-2 text-xs font-black text-[#d98a2b]">{viewer ? '已登录' : '去登录'}</span>
              </div>

              <div className="mt-5 space-y-4">
                {vitalItems.map((item) => (
                  <VitalMeterRow
                    key={item.key}
                    barClassName={item.bar}
                    enabled={Boolean(viewer)}
                    hint={item.hint}
                    label={item.label}
                    metric={item.key}
                    value={viewerVitals?.[item.key] ?? 0}
                  />
                ))}
              </div>
            </Panel>

          </aside>

          <div className="relative order-first flex min-h-[640px] items-end justify-center md:min-h-[760px] lg:order-none lg:min-h-[980px]">
            <div className="neko-room-glow" />
            <div className="absolute inset-x-10 top-10 bottom-24 rounded-[140px] bg-[radial-gradient(circle_at_center,rgba(255,237,214,0.46),rgba(255,244,234,0)_70%)]" />
            <div className="absolute bottom-12 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(204,171,137,0.18),rgba(255,241,229,0)_68%)]" />
            <Image
              src="/assets/companion-lumia-stage-cutout.png"
              alt="Lumia 养成伙伴"
              width={430}
              height={1060}
              unoptimized
              priority
              className="neko-avatar relative z-10 h-[620px] w-auto max-w-[82vw] object-contain md:h-[820px] lg:h-[930px]"
            />
          </div>

          <aside className="z-10 flex flex-col gap-5 lg:pt-20">
            <Panel className="min-h-[520px]">
              <div className="text-sm font-black uppercase tracking-[0.18em] text-[var(--neko-muted)]">当前场景</div>
              <div className="mt-4 text-[1.9rem] font-black leading-tight text-[#171414]">{getSceneHeadline(mood)}</div>
              <div className="mt-6 space-y-3">
                <InlineStageRow dot="green" label="总目标" value={formatCompactCurrency(settings.total_target)} />
                <InlineStageRow dot="rose" label="累计收入" value={formatCompactCurrency(summary.totalRevenue)} />
              </div>
              <div className="mt-6 border-t border-[var(--neko-line)] pt-6">
                <div className="mb-4 text-lg font-black text-[var(--neko-ink)]">关爱账本</div>
                <div className="space-y-3">
                  <SummaryRow label="今日互动" value={`${todayCareTotal} 次`} />
                  <SummaryRow label="第几天" value={`Day ${summary.currentDay}`} />
                  <SummaryRow label="今日收入" value={formatCurrency(summary.todayRevenue)} />
                  <RemainingDaysRow remainingDays={remainingDays} totalDays={settings.total_days} />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--neko-line)] pt-5">
                <SummaryTag label="复盘日记" value={`${posts.length} 篇`} />
                <SummaryTag label="进行项目" value={`${summary.activeProjects} 个`} />
              </div>
              <div className="mt-5">
                <WatchSeat stats={homeStatus.reactionStats} />
              </div>
            </Panel>
          </aside>
        </div>

        <div className="relative z-20 mx-auto grid max-w-[1120px] gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <ShareReportCard
            currentDay={summary.currentDay}
            mood={mood}
            todayRevenue={summary.todayRevenue}
            totalRevenue={summary.totalRevenue}
            headline={heroHeadline}
          />
          <GrowthMap days={data.growthMap} currentDay={summary.currentDay} />
        </div>

        <div className="relative z-20 mx-auto mt-5 grid max-w-[1120px] gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <StageReports reports={data.stageReports} />
          <TrustLedger records={data.ledgerRecords} />
        </div>

        <div className="relative z-20 mx-auto mt-5 max-w-[1120px]">
          <RiskNotice />
        </div>

        <div className="relative z-20 mx-auto mt-1 max-w-[980px]">
          <div className="rounded-[34px] border border-[var(--neko-line)] bg-white/78 p-3 shadow-[0_18px_46px_rgba(93,65,57,0.11)] backdrop-blur-xl">
            <div className="flex items-center gap-3 rounded-full bg-white/86 px-4 py-3">
              <span className="rounded-full bg-[#f7dfe4] px-3 py-2 text-sm font-black text-[var(--neko-red)]">跟 Lumia</span>
              <span className="min-w-0 flex-1 truncate text-sm text-[var(--neko-muted)]">{viewer ? `${viewerName}，今天想先说哪件事？` : '说点什么，把今天的状态留下来...'}</span>
              <Mic size={18} className="hidden text-[var(--neko-muted)] sm:block" />
              <Link href="/app/today?tab=tasks" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--neko-red)] text-white shadow-[0_12px_26px_rgba(201,101,113,0.24)] transition hover:-translate-y-0.5 hover:bg-[#b95766]">
                <Send size={16} />
              </Link>
            </div>
          </div>
        </div>

        <div className="relative z-20 mx-auto mt-5 max-w-[1088px]">
          <nav className="neko-dock">
            <DockItem href="/" icon={<PawPrint size={31} />} label="首页" active />
            <DockItem href="/app/progress" icon={<Target size={31} />} label="进度" />
            <DockItem href="/app/projects" icon={<Compass size={31} />} label="项目" />
            <DockItem href="/articles" icon={<BookOpen size={31} />} label="日记" />
            <DockItem href="/app/today?tab=tasks" icon={<Zap size={31} />} label="录入" />
            <DockItem href="/me" icon={<UserRound size={31} />} label="我的" />
          </nav>
        </div>
      </div>
    </section>
  );
}

function WatchSeat({ stats }: { stats: DashboardData['homeStatus']['reactionStats'] }) {
  const items = [
    { key: 'watch', label: '陪伴一下', value: stats.watch },
    { key: 'favorite', label: '收藏追更', value: stats.favorite },
    { key: 'cheer', label: '点赞记录', value: stats.cheer },
  ] as const;

  return (
    <div className="rounded-[22px] border border-[var(--neko-line)] bg-white/58 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-black text-[var(--neko-ink)]">
          <HeartHandshake size={18} className="text-[var(--neko-red)]" />
          围观席
        </span>
        <span className="text-xs font-black text-[var(--neko-red)]">{stats.total} 次互动</span>
      </div>
      <div className="grid gap-2">
        {items.map((item) => (
          <form key={item.key} action={addViewerReaction}>
            <input type="hidden" name="reactionKey" value={item.key} />
            <button type="submit" className="flex w-full items-center justify-between rounded-[16px] bg-white/72 px-3 py-2 text-xs font-black text-[var(--neko-brown)] transition hover:bg-white">
              <span>{item.label}</span>
              <span className="text-[var(--neko-red)]">{item.value}</span>
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}

function ShareReportCard({
  currentDay,
  headline,
  mood,
  todayRevenue,
  totalRevenue,
}: {
  currentDay: number;
  headline: string;
  mood: string;
  todayRevenue: number;
  totalRevenue: number;
}) {
  return (
    <section className="neko-panel">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-[var(--neko-red)]">
            <Sparkles size={18} />
            每日战报卡
          </div>
          <h2 className="mt-2 text-2xl font-black text-[var(--neko-ink)]">Day {currentDay} 的公开围观版</h2>
        </div>
        <span className="rounded-full bg-[#fff0de] px-3 py-1 text-xs font-black text-[#e28e32]">可截图分享</span>
      </div>
      <div className="rounded-[28px] border border-[var(--neko-line)] bg-[linear-gradient(135deg,#fffaf6,#f8dfe5)] p-5">
        <div className="text-xs font-bold text-[var(--neko-muted)]">1000天真实盈利养成记录</div>
        <div className="mt-3 text-3xl font-black leading-tight text-[var(--neko-ink)]">{headline}，继续记录真实的一天</div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <ReportMetric label="今日收入" value={formatCurrency(todayRevenue)} />
          <ReportMetric label="累计收入" value={formatCurrency(totalRevenue)} />
          <ReportMetric label="精神状态" value={mood} />
          <ReportMetric label="陪伴角色" value="Lumia" />
        </div>
      </div>
    </section>
  );
}

function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/70 bg-white/62 px-4 py-3">
      <div className="text-xs text-[var(--neko-muted)]">{label}</div>
      <div className="mt-1 truncate text-base font-black text-[var(--neko-ink)]">{value}</div>
    </div>
  );
}

function GrowthMap({ currentDay, days }: { currentDay: number; days: DashboardData['growthMap'] }) {
  return (
    <section className="neko-panel">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-[var(--neko-red)]">
            <Map size={18} />
            1000天成长地图
          </div>
          <h2 className="mt-2 text-2xl font-black text-[var(--neko-ink)]">已经走到 Day {currentDay}</h2>
        </div>
        <span className="rounded-full bg-[#eef8f2] px-3 py-1 text-xs font-black text-[#2e815e]">完整 1000 天</span>
      </div>
      <div className="grid grid-cols-20 gap-1.5">
        {days.map((day) => (
          <span key={day.day} title={`Day ${day.day}`} className={`aspect-square rounded-[7px] ${growthDayClass(day.status)}`} />
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-[var(--neko-muted)]">
        <Legend dot="bg-[#4abc91]" label="盈利" />
        <Legend dot="bg-[var(--neko-red)]" label="今日" />
        <Legend dot="bg-[#df6f78]" label="回撤" />
        <Legend dot="bg-[#e9ddd6]" label="待记录" />
      </div>
    </section>
  );
}

function growthDayClass(status: DashboardData['growthMap'][number]['status']) {
  const classes = {
    future: 'bg-[#e9ddd6]',
    profit: 'bg-[#4abc91]',
    loss: 'bg-[#df6f78]',
    flat: 'bg-[#f2d6b1]',
    today: 'bg-[var(--neko-red)] ring-2 ring-white',
  };

  return classes[status];
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function StageReports({ reports }: { reports: DashboardData['stageReports'] }) {
  return (
    <section className="neko-panel">
      <div className="mb-5 text-sm font-black text-[var(--neko-red)]">阶段复盘报告</div>
      <div className="grid gap-3">
        {reports.map((report) => (
          <div key={report.days} className="rounded-[22px] border border-[var(--neko-line)] bg-white/62 px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-base font-black text-[var(--neko-ink)]">{report.label}</div>
                <div className="mt-1 text-xs text-[var(--neko-muted)]">日均 {formatCurrency(report.average)}</div>
              </div>
              <div className="text-right text-sm font-black text-[var(--neko-red)]">{formatCurrency(report.revenue)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TrustLedger({ records }: { records: DashboardData['ledgerRecords'] }) {
  return (
    <section className="neko-panel">
      <div className="mb-5 text-sm font-black text-[var(--neko-red)]">可信账本</div>
      <div className="space-y-3">
        {records.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-[var(--neko-line)] bg-white/50 px-4 py-5 text-sm text-[var(--neko-muted)]">还没有收入记录。</div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="grid gap-3 rounded-[22px] border border-[var(--neko-line)] bg-white/62 px-4 py-3 sm:grid-cols-[88px_1fr_auto] sm:items-center">
              <span className="rounded-full bg-[#fff0de] px-3 py-1 text-center text-xs font-bold text-[#e28e32]">{formatDate(record.record_date)}</span>
              <div className="min-w-0">
                <div className="truncate text-sm font-black text-[var(--neko-ink)]">{record.projects?.name ?? '未命名项目'}</div>
                <div className="mt-1 text-xs text-[var(--neko-muted)]">{getIncomeTypeLabel(record.income_type)} · {record.note || '当日记录'}</div>
              </div>
              <strong className={Number(record.amount) >= 0 ? 'text-[var(--neko-red)]' : 'text-[var(--danger)]'}>{formatCurrency(Number(record.amount))}</strong>
            </div>
          ))
        )}
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
}: {
  mood: string;
  style: { text: string; dot: string; surface: string };
}) {
  return (
    <span data-testid="home-mood-chip" className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-black ${style.surface} ${style.text} text-sm`}>
      <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
      当前精神状态：{mood}
    </span>
  );
}

function VitalMeterRow({
  barClassName,
  enabled,
  hint,
  label,
  metric,
  value,
}: {
  barClassName: string;
  enabled: boolean;
  hint: string;
  label: string;
  metric: (typeof vitalItems)[number]['key'];
  value: number;
}) {
  const progress = clampPercent(value * 18);

  return (
    <div data-testid={`home-vital-${metric}`} className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-black text-[var(--neko-ink)]">{label}</div>
          <div className="mt-0.5 text-xs text-[var(--neko-muted)]">{hint}</div>
        </div>
        <div className="flex items-center gap-2">
          <span data-testid={`home-vital-${metric}-value`} className="min-w-[40px] text-right text-sm font-black text-[var(--neko-ink)]">
            {value}
          </span>
          {enabled ? (
            <form action={incrementHomeVital}>
              <input type="hidden" name="metric" value={metric} />
              <button
                type="submit"
                data-testid={`home-vital-${metric}-button`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--neko-red)] shadow-[0_10px_22px_rgba(93,65,57,0.12)] transition hover:-translate-y-0.5 hover:bg-[#fff7f3]"
                aria-label={`增加${label}`}
              >
                <Plus size={16} />
              </button>
            </form>
          ) : (
            <Link
              href="/login?next=/"
              data-testid={`home-vital-${metric}-button`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--neko-red)] shadow-[0_10px_22px_rgba(93,65,57,0.12)] transition hover:-translate-y-0.5 hover:bg-[#fff7f3]"
              aria-label={`登录后记录${label}`}
            >
              <Plus size={16} />
            </Link>
          )}
        </div>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[#e5d8d0]">
        <span className={`block h-full rounded-full ${barClassName}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[var(--neko-line)] bg-white/62 px-4 py-3 text-sm">
      <span className="text-[var(--neko-brown)]">{label}</span>
      <strong className="text-[var(--neko-ink)]">{value}</strong>
    </div>
  );
}

function RemainingDaysRow({ remainingDays, totalDays }: { remainingDays: number; totalDays: number }) {
  const progress = clampPercent((remainingDays / totalDays) * 100);

  return (
    <div className="rounded-[18px] border border-[var(--neko-line)] bg-white/62 px-4 py-3">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-[var(--neko-brown)]">剩余天数</span>
        <strong className="text-[var(--neko-ink)]">{remainingDays} 天</strong>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#e8ddd5]">
        <span
          className="block h-full rounded-full bg-[linear-gradient(90deg,#f2ac67,#e58b6c)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function InlineStageRow({ dot, label, value }: { dot: 'green' | 'rose' | 'orange'; label: string; value: string }) {
  const dotClass = dot === 'green' ? 'bg-[#4abc91]' : dot === 'rose' ? 'bg-[var(--neko-red)]' : 'bg-[#eea13d]';

  return (
    <div className="flex items-center justify-between rounded-[18px] border border-[var(--neko-line)] bg-white/66 px-4 py-3 text-sm">
      <span className="flex items-center gap-2 text-[var(--neko-brown)]">
        <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
        {label}
      </span>
      <strong className="text-[var(--neko-ink)]">{value}</strong>
    </div>
  );
}

function SummaryTag({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-[var(--neko-line)] bg-white/62 px-4 py-4">
      <div className="text-xs text-[var(--neko-muted)]">{label}</div>
      <div className="mt-2 text-lg font-black text-[var(--neko-ink)]">{value}</div>
    </div>
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

function getHeroHeadline(hour: number) {
  if (hour < 6) return '夜深了...';
  if (hour < 11) return '早安了...';
  if (hour < 18) return '下午好...';
  return '晚上好...';
}

function getMoodCopy(mood: string) {
  switch (mood) {
    case '开心':
      return '今天的情绪是亮的，顺着这股劲把眼前的一小步走完，整天都会更轻。';
    case '乐观':
      return '你现在的底色偏稳，先别急着看太远，把今天该做的那一步踏实落地。';
    case '焦虑':
      return '不用一口气把所有事都想明白，先让自己安静下来，再做最小的动作。';
    case '沮丧':
      return '低落不代表停住了，先把自己照顾好，今天能完成一点点就够了。';
    case '痛苦':
      return '今天只要还在撑、还在呼吸、还在往前挪一点点，就已经很不容易。';
    default:
      return '先慢一点也没关系，把今天过稳，把最小的一步做出来，状态就会重新回来。';
  }
}

function getSceneHeadline(mood: string) {
  switch (mood) {
    case '开心':
      return '她现在像一束亮一点的光，陪你把今天往前拨一格。';
    case '乐观':
      return '她应该是桌面上一直陪着你的主角，安静，但在给你撑着场。';
    case '焦虑':
      return '她会提醒你先别慌，把手头这一件做好，比什么都重要。';
    case '沮丧':
      return '她今天更像安静坐在旁边的人，不催你，只陪你一点点缓过来。';
    case '痛苦':
      return '她现在存在的意义，不是催你赢，而是陪你先把今天熬过去。';
    default:
      return '她应该是桌面上一直陪着你的主角，陪你把情绪放稳，再慢慢往前。';
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
