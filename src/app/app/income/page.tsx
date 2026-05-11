import { TodayIncomeForm } from '@/components/app/forms';
import { SectionHeader } from '@/components/app/section-header';
import { Card } from '@/components/ui/card';
import { getIncomeRecords, getProjects } from '@/lib/data/queries';
import { formatCurrency, formatDate } from '@/lib/utils/format';

export default async function IncomePage() {
  const [projects, records] = await Promise.all([getProjects(), getIncomeRecords()]);

  return (
    <div className="space-y-6">
      <SectionHeader title="收入情况" description="收入只登记当天，可正可负。保存后，首页、项目页和进度页都会自动重算。" />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <TodayIncomeForm projects={projects} />

        <Card className="rounded-[30px] p-5">
          <div className="mb-4 text-lg font-semibold text-[var(--foreground)]">最近收入记录</div>
          <div className="space-y-3">
            {records.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted)]">还没有收入数据。</div>
            ) : (
              records.map((record) => (
                <div key={record.id} className="grid gap-2 rounded-[20px] border border-[var(--border)] bg-white/70 px-4 py-4 md:grid-cols-[120px_1fr_auto] md:items-center">
                  <div className="text-sm text-[var(--muted)]">{formatDate(record.record_date)}</div>
                  <div>
                    <div className="text-sm font-medium text-[var(--foreground)]">{record.projects?.name ?? '未命名项目'}</div>
                    <div className="mt-1 text-xs text-[var(--muted)]">{record.note || '无备注'}</div>
                  </div>
                  <div className={`text-sm font-semibold ${Number(record.amount) >= 0 ? 'text-[#146f5e]' : 'text-[#b25b33]'}`}>
                    {formatCurrency(Number(record.amount))}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
