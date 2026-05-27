import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Coins, HeartPulse, ShieldCheck, Wifi } from 'lucide-react';

import type { AwaitedReturn } from '@/types/common';
import { formatCurrency } from '@/lib/utils/format';

type DashboardData = AwaitedReturn<typeof import('@/lib/data/queries').getDashboardData>;

export function RevenueOverview({ data }: { data: DashboardData }) {
  const maxAbs = Math.max(...data.recentRevenue.map((item) => Math.abs(item.amount)), 1);

  return (
    <section className="page-shell grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
      <div className="neko-section p-6 md:p-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="neko-chip text-xs font-bold uppercase tracking-[0.16em]">
              <HeartPulse size={17} /> Growth Rhythm
            </div>
            <h2 className="mt-4 text-3xl font-black text-[var(--neko-ink)]">成长日志：过去 14 天收入心跳</h2>
          </div>
          <div className="text-sm text-[var(--neko-muted)]">每一笔收入都会变成 Lumia 的成长值</div>
        </div>

        <div className="grid h-[300px] grid-cols-14 items-end gap-2 rounded-[26px] border border-[var(--neko-line)] bg-white/52 p-4">
          {data.recentRevenue.map((item) => {
            const positive = item.amount >= 0;
            const abs = Math.min(Math.max(Math.abs(item.amount) / maxAbs, 0.08), 1);

            return (
              <div key={item.date} className="flex h-full flex-col justify-end gap-2">
                <div className="relative flex-1 overflow-hidden rounded-t-[20px] rounded-b-[12px] bg-[#eaded8]">
                  <div
                    className={`absolute inset-x-0 bottom-0 rounded-t-[20px] ${positive ? 'bg-[linear-gradient(180deg,#d96d79,#eea13d)]' : 'bg-[linear-gradient(180deg,#7f8790,#3f464d)]'}`}
                    style={{ height: `${abs * 100}%` }}
                  />
                </div>
                <div className="text-center text-[11px] font-medium text-[var(--neko-muted)]">{item.date}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="neko-section p-6 md:p-8">
        <div className="neko-chip text-xs font-bold uppercase tracking-[0.16em]">
          <Wifi size={17} /> Companion Assets
        </div>
        <h2 className="mt-4 text-3xl font-black text-[var(--neko-ink)]">收入来源变成世界资产</h2>

        <div className="mt-7 space-y-4">
          {data.projectTotals.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[var(--neko-line)] bg-white/48 px-5 py-8 text-sm leading-7 text-[var(--neko-muted)]">
              还没有项目数据。创建一个收入项目后，它会以“世界资产”的形式出现在这里。
            </div>
          ) : (
            data.projectTotals.slice(0, 4).map((project) => {
              const positive = project.total >= 0;
              return (
                <div key={project.id} className="rounded-[24px] border border-[var(--neko-line)] bg-white/58 px-5 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-[#fff0de] text-[#df8f34]">
                        <Coins size={27} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-lg font-black text-[var(--neko-ink)]">{project.name}</div>
                        <div className="mt-1 text-sm text-[var(--neko-muted)]">{project.status === 'active' ? '运行中' : '已归档'}</div>
                      </div>
                    </div>

                    <div className={`flex shrink-0 items-center gap-2 text-sm font-black ${positive ? 'text-[var(--neko-red)]' : 'text-[#525b63]'}`}>
                      {positive ? <ArrowUpRight size={17} /> : <ArrowDownRight size={17} />}
                      {formatCurrency(project.total)}
                    </div>
                  </div>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#eaded8]">
                    <span className="block h-full rounded-full bg-[linear-gradient(90deg,#c96571,#eea13d)]" style={{ width: `${Math.min(Math.abs(project.total) / 100000 * 100, 100)}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <SmallStatus icon={<ShieldCheck size={21} />} label="本地优先" value="已启用" />
          <SmallStatus icon={<HeartPulse size={21} />} label="真实记录" value="持续同步" />
        </div>
      </div>
    </section>
  );
}

function SmallStatus({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[20px] border border-[var(--neko-line)] bg-white/48 px-4 py-4">
      <span className="flex items-center gap-2 text-[var(--neko-brown)]">{icon}{label}</span>
      <span className="font-bold text-[#43a676]">{value}</span>
    </div>
  );
}
