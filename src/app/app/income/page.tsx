import { TodayIncomeForm } from '@/components/app/forms';
import { AdminPanel, EmptyState, PanelHeading } from '@/components/app/admin-ui';
import { SectionHeader } from '@/components/app/section-header';
import { getIncomeRecords, getProjects } from '@/lib/data/queries';
import { formatCurrency, formatDate } from '@/lib/utils/format';

export default async function IncomePage() {
  const [projects, records] = await Promise.all([getProjects(), getIncomeRecords()]);
  const totalRevenue = records.reduce((sum, item) => sum + Number(item.amount), 0);
  const today = formatDate(new Date());
  const todayRevenue = records.filter((item) => item.record_date === today).reduce((sum, item) => sum + Number(item.amount), 0);
  const positiveRecords = records.filter((item) => Number(item.amount) >= 0).length;

  return (
    <div className="space-y-6">
      <SectionHeader title="收入情况" description="收入只登记当天，可正可负。保存后，首页、项目页和进度页都会自动重算。" />

      <div className="grid gap-4 md:grid-cols-3">
        <IncomeStat label="累计收入" value={formatCurrency(totalRevenue)} muted={`${records.length} 条收入记录`} />
        <IncomeStat label="今日收入" value={formatCurrency(todayRevenue)} muted={today} />
        <IncomeStat label="正向记录" value={`${positiveRecords} 条`} muted="负数收入也保留为真实记录" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <TodayIncomeForm projects={projects} />

        <AdminPanel>
          <PanelHeading title="最近收入记录" description="按创建时间倒序展示。金额为负数时保留真实记录，不单独记录成本。" />
          <div className="space-y-3">
            {records.length === 0 ? (
              <EmptyState>还没有收入数据。</EmptyState>
            ) : (
              records.map((record) => (
                <div key={record.id} className="grid gap-2 rounded-[18px] border border-[var(--border)] bg-white/74 px-4 py-4 transition hover:border-[rgba(102,126,234,0.35)] hover:bg-white md:grid-cols-[120px_1fr_auto] md:items-center">
                  <div className="text-sm text-[var(--muted)]">{formatDate(record.record_date)}</div>
                  <div>
                    <div className="text-sm font-medium text-[var(--foreground)]">{record.projects?.name ?? '未命名项目'}</div>
                    <div className="mt-1 text-xs text-[var(--muted)]">{record.note || '无备注'}</div>
                  </div>
                  <div className={`text-sm font-semibold ${Number(record.amount) >= 0 ? 'text-[var(--accent)]' : 'text-[var(--danger)]'}`}>
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
      <div className="text-sm text-[var(--muted)]">{label}</div>
      <div className="serif-heading mt-2 text-3xl text-[var(--foreground)]">{value}</div>
      <div className="mt-2 text-xs text-[var(--muted)]">{muted}</div>
    </AdminPanel>
  );
}
