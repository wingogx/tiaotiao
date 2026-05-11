import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

import type { AwaitedReturn } from '@/types/common';
import { formatCurrency } from '@/lib/utils/format';

import { Card } from '@/components/ui/card';

type DashboardData = AwaitedReturn<typeof import('@/lib/data/queries').getDashboardData>;

export function RevenueOverview({ data }: { data: DashboardData }) {
  return (
    <section className="page-shell grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="rounded-[32px] p-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">收入节奏</div>
            <h2 className="serif-heading mt-2 text-3xl">过去 14 天收入波动</h2>
          </div>
        </div>

        <div className="mt-8 grid h-[280px] grid-cols-14 items-end gap-2">
          {data.recentRevenue.map((item) => {
            const positive = item.amount >= 0;
            const abs = Math.min(Math.max(Math.abs(item.amount) / 2000, 0.08), 1);

            return (
              <div key={item.date} className="flex h-full flex-col justify-end gap-2">
                <div className="relative flex-1 overflow-hidden rounded-t-[18px] rounded-b-[10px] bg-[rgba(19,51,40,0.08)]">
                  <div
                    className={`absolute inset-x-0 bottom-0 rounded-t-[18px] ${positive ? 'bg-[linear-gradient(180deg,#1f8a72,#0f6b5a)]' : 'bg-[linear-gradient(180deg,#df9a68,#b65d2c)]'}`}
                    style={{ height: `${abs * 100}%` }}
                  />
                </div>
                <div className="text-center text-[11px] text-[var(--muted)]">{item.date}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="rounded-[32px] p-7">
        <div className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">项目表现</div>
        <h2 className="serif-heading mt-2 text-3xl">当前并行中的项目</h2>

        <div className="mt-6 space-y-4">
          {data.projectTotals.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[var(--border)] px-5 py-8 text-sm text-[var(--muted)]">
              还没有项目数据。第一版上线后，你可以先录入小红书、视频号、知识星球这些项目。
            </div>
          ) : (
            data.projectTotals.slice(0, 4).map((project) => {
              const positive = project.total >= 0;
              return (
                <div
                  key={project.id}
                  className="flex items-center justify-between rounded-[24px] border border-[var(--border)] bg-white/70 px-4 py-4"
                >
                  <div>
                    <div className="text-base font-medium text-[var(--foreground)]">{project.name}</div>
                    <div className="mt-1 text-sm text-[var(--muted)]">
                      {project.status === 'active' ? '进行中' : '已关闭'}
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 text-sm font-semibold ${positive ? 'text-[#13725f]' : 'text-[#b15b33]'}`}>
                    {positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {formatCurrency(project.total)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </section>
  );
}
