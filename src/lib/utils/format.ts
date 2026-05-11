import { differenceInCalendarDays, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

export function formatDate(value: string | Date) {
  return format(new Date(value), 'yyyy-MM-dd', { locale: zhCN });
}

export function getCurrentDayIndex(startDate: string) {
  return Math.max(1, differenceInCalendarDays(new Date(), new Date(startDate)) + 1);
}

export function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function excerptFromMarkdown(content: string, maxLength = 140) {
  const plain = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#>*_`\-\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trim()}...`;
}
