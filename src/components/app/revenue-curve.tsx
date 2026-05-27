'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { formatCurrency } from '@/lib/utils/format';

import { EmptyState } from '@/components/app/admin-ui';

type RevenueCurvePoint = {
  date: string;
  amount: number;
  total: number;
};

export function RevenueCurve({ data }: { data: RevenueCurvePoint[] }) {
  if (data.length === 0) {
    return <EmptyState>还没有收入记录，登记收入后这里会显示日期和收益曲线。</EmptyState>;
  }

  return (
    <div className="h-[300px] w-full overflow-hidden rounded-[24px] border border-[var(--neko-line)] bg-white/62 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.32} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(107,78,68,0.1)" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} minTickGap={24} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `¥${Number(value).toLocaleString('zh-CN')}`} width={86} />
          <Tooltip
            formatter={(value, name) => [formatCurrency(Number(value)), name === 'total' ? '累计收入' : '当日收入']}
            labelFormatter={(label) => `日期 ${label}`}
            contentStyle={{ borderRadius: 16, border: '1px solid rgba(37,48,68,0.1)' }}
          />
          <Area type="monotone" dataKey="total" stroke="var(--accent)" strokeWidth={3} fill="url(#revenueTotal)" dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
