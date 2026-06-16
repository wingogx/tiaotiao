import { TodayIncomeForm } from '@/components/app/forms';
import { AdminPanel, EmptyState, PanelHeading } from '@/components/app/admin-ui';
import { SectionHeader } from '@/components/app/section-header';
import { getIncomeRecords, getProjects, getIncomeTypeLabel } from '@/lib/data/queries';
import { formatCurrency, formatDate } from '@/lib/utils/format';

export default async function IncomePage() {
  const [projects, records] = await Promise.all([getProjects(), getIncomeRecords()]);
  const totalRevenue = records.reduce((sum, item) => sum + Number(item.amount), 0);
  const today = formatDate(new Date());
  const todayRevenue = records.filter((item) => item.record_date === today).reduce((sum, item) => sum + Number(item.amount), 0);
  const positiveRecords = records.filter((item) => Number(item.amount) >= 0).length;

  return (
    <div className="space-y-5">
      <SectionHeader title="收入背包" description="登记今天新增的收益经验，首页、项目地图和进度页会自动同步。" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <IncomeStat label="累计收入" value={formatCurrency(totalRevenue)} muted={`${records.length} 条收入记录`} />
        <IncomeStat label="今日收入" value={formatCurrency(todayRevenue)} muted={today} />
        <IncomeStat label="正向记录" value={`${positiveRecords} 条`} muted="负数收入也保留为真实记录" />
      </div>

      <div className="grid gap-5 md:grid-cols-[0.82fr_1.18fr]">
        <TodayIncomeForm projects={projects} />

        <AdminPanel>
          <PanelHeading title="收益时间线" description="每一条记录都是养成经验；负数会保留为真实回撤。" />
          <div className="space-y-3">
            {records.length === 0 ? (
              <EmptyState>还没有收入数据。</EmptyState>
            ) : (
              records.map((record) => (
                <div key={record.id} className="grid gap-3 rounded-[24px] border border-[var(--neko-line)] bg-white/72 px-4 py-4 shadow-sm transition hover:bg-white sm:grid-cols-[92px_1fr_auto] sm:items-center">
                  <div className="rounded-full bg-[#fff0de] px-3 py-1 text-center text-xs font-bold text-[#e28e32]">{formatDate(record.record_date)}</div>
                  <div>
                    <div className="text-sm font-black text-[var(--neko-ink)]">{record.projects?.name ?? '未命名项目'}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-[var(--neko-muted)]">
                      <span className="rounded-full bg-[#f7dfe4] px-2.5 py-1 font-bold text-[var(--neko-red)]">{getIncomeTypeLabel(record.income_type)}</span>
                      <span className="leading-6">{record.note || '无备注'}</span>
                    </div>
                  </div>
                  <div className={`text-right text-sm font-black ${Number(record.amount) >= 0 ? 'text-[var(--neko-red)]' : 'text-[var(--danger)]'}`}>
                    {formatCurrency(Number(record.amount))}
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}

function IncomeStat({ label, value, muted }: { label: string; value: string; muted: string }) {
  return (
    <AdminPanel>
      <div className="text-sm text-[var(--neko-muted)]">{label}</div>
      <div className="mt-2 truncate text-2xl font-black text-[var(--neko-ink)] md:text-3xl">{value}</div>
      <div className="mt-2 text-xs text-[var(--neko-muted)]">{muted}</div>
    </AdminPanel>
  );
}
