import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BookOpen, ChevronRight, Coins, Compass, LockKeyhole, ShieldCheck, Target, Zap } from 'lucide-react';

import { getViewerAccess } from '@/lib/auth/session';
import { getDashboardData } from '@/lib/data/queries';
import { formatCurrency, formatPercent } from '@/lib/utils/format';

import { MobileAppShell } from '@/components/mobile/mobile-app-shell';

export default async function MePage() {
  const [viewer, data] = await Promise.all([getViewerAccess(), getDashboardData()]);
  const accountLabel = viewer.profile?.display_name ?? viewer.profile?.email ?? '我';
  const roleLabel = viewer.isAdmin ? '管理员' : viewer.canViewArticles ? '会员' : viewer.profile ? '待开通' : '未登录';
  const activeProjects = data.projectTotals.filter((item) => item.status === 'active').length;

  return (
    <MobileAppShell accountLabel={accountLabel}>
      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-[0.82fr_1.18fr]">
          <section className="rounded-[32px] border border-[var(--neko-line)] bg-white/78 p-5 shadow-[0_14px_34px_rgba(93,65,57,0.08)] backdrop-blur-xl">
            <div className="flex items-center gap-4 md:block">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[var(--neko-line)] bg-[#f7dfe4] text-3xl font-black text-[var(--neko-red)] md:mx-auto md:h-24 md:w-24">
                {accountLabel.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 md:mt-4 md:text-center">
                <div className="truncate text-2xl font-black text-[var(--neko-ink)]">{viewer.profile?.display_name ?? '挑战观察员'}</div>
                <div className="mt-1 truncate text-sm text-[var(--neko-muted)]">{viewer.profile?.email ?? '登录后同步账号与会员权限'}</div>
                <div className="mt-3 inline-flex rounded-full border border-[var(--neko-line)] bg-white/72 px-3 py-1 text-xs font-bold text-[var(--neko-red)]">
                  {roleLabel}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <AssetChip icon={<Target size={19} />} label="挑战天数" value={`第 ${data.summary.currentDay} 天`} />
              <AssetChip icon={<Coins size={19} />} label="累计收入" value={formatCurrency(data.summary.totalRevenue)} />
              <AssetChip icon={<Compass size={19} />} label="进行项目" value={`${activeProjects} 个`} />
              <AssetChip icon={<BookOpen size={19} />} label="复盘文章" value={`${data.posts.length} 篇`} />
            </div>
          </section>

          <section className="overflow-hidden rounded-[32px] border border-[var(--neko-line)] bg-white/78 shadow-[0_14px_34px_rgba(93,65,57,0.08)] backdrop-blur-xl">
            <div className="relative min-h-[360px] bg-[radial-gradient(circle_at_50%_10%,rgba(255,224,193,0.9),transparent_48%),linear-gradient(180deg,#fffaf6,#f5e7dc)] md:min-h-[430px]">
              <Image
                src="/assets/companion-lumia-stage-cutout.png"
                alt="Lumia 同伴"
                width={240}
                height={600}
                unoptimized
                className="absolute bottom-0 left-2 h-[340px] w-auto object-contain drop-shadow-[0_20px_30px_rgba(118,88,78,0.2)] md:left-8 md:h-[410px]"
              />
              <div className="absolute bottom-5 right-5 w-[190px] rounded-[26px] border border-[var(--neko-line)] bg-white/78 p-4 shadow-[0_14px_34px_rgba(93,65,57,0.12)] backdrop-blur-xl md:w-[220px]">
                <div className="text-2xl font-black text-[var(--neko-ink)]">Lumia</div>
                <div className="mt-2 inline-flex rounded-full bg-[#f7dfe4] px-3 py-1 text-xs font-bold text-[var(--neko-red)]">当前同伴</div>
                <div className="mt-4 text-xs leading-6 text-[var(--neko-muted)]">把收入、任务、复盘转成挑战进度。</div>
                <ProgressLine label="目标进度" value={data.summary.incomeProgress} />
                <Link href="/app/today" className="mt-4 flex h-11 items-center justify-center rounded-full bg-[var(--neko-red)] text-sm font-black text-white shadow-[0_12px_24px_rgba(201,101,113,0.24)]">
                  今日录入
                </Link>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="grid gap-3">
            <ActionRow href="/articles" icon={<BookOpen size={22} />} title="每日复盘" subtitle="查看公开摘要与会员正文" />
            <ActionRow href="/app/progress" icon={<Target size={22} />} title="完成进度" subtitle={`${formatPercent(data.summary.incomeProgress)} · 距目标 ${formatCurrency(data.summary.gapToGoal)}`} />
            <ActionRow href="/app/projects" icon={<Compass size={22} />} title="项目看板" subtitle={`${activeProjects} 个收入来源运行中`} />
            {viewer.profile ? (
              <ActionRow href="/app/today" icon={<Zap size={22} />} title="今日行动" subtitle="收入、任务、文章轻量录入" />
            ) : (
              <ActionRow href="/login" icon={<LockKeyhole size={22} />} title="登录账号" subtitle="登录后同步会员权限和行动入口" />
            )}
          </section>

          <section className="rounded-[32px] border border-[var(--neko-line)] bg-white/78 p-5 shadow-[0_14px_34px_rgba(93,65,57,0.08)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2 text-lg font-black text-[var(--neko-ink)]">
              <ShieldCheck size={21} className="text-[var(--neko-red)]" />
              权限与数据
            </div>
            <div className="space-y-3 text-sm">
              <InfoRow label="公开内容" value="标题 / 摘要" />
              <InfoRow label="正文权限" value={viewer.canViewArticles ? '已开通' : '未开通'} />
              <InfoRow label="管理入口" value={viewer.isAdmin ? '已开启' : '未开启'} />
            </div>
          </section>
        </div>
      </div>
    </MobileAppShell>
  );
}

function AssetChip({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[var(--neko-line)] bg-white/68 p-3">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff0de] text-[#e28e32]">{icon}</div>
      <div className="text-xs text-[var(--neko-muted)]">{label}</div>
      <div className="mt-1 truncate text-lg font-black text-[var(--neko-ink)]">{value}</div>
    </div>
  );
}

function ProgressLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between text-xs font-bold text-[var(--neko-brown)]">
        <span>{label}</span>
        <span>{formatPercent(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#eadbd4]">
        <span className="block h-full rounded-full bg-[var(--neko-red)]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

function ActionRow({ href, icon, title, subtitle }: { href: string; icon: ReactNode; title: string; subtitle: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 rounded-[26px] border border-[var(--neko-line)] bg-white/78 p-4 shadow-[0_12px_30px_rgba(93,65,57,0.07)] backdrop-blur-xl">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[#f7dfe4] text-[var(--neko-red)]">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-black text-[var(--neko-ink)]">{title}</span>
        <span className="mt-1 block truncate text-xs text-[var(--neko-muted)]">{subtitle}</span>
      </span>
      <ChevronRight size={20} className="text-[var(--neko-muted)]" />
    </Link>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[18px] border border-[var(--neko-line)] bg-white/62 px-4 py-3">
      <span className="text-[var(--neko-muted)]">{label}</span>
      <span className="font-bold text-[var(--neko-ink)]">{value}</span>
    </div>
  );
}
