'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, ClipboardList, Coins, FileText, FolderKanban, LayoutDashboard, ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

const items = [
  { href: '/app/today', label: '今日录入', icon: LayoutDashboard },
  { href: '/app/projects', label: '项目看板', icon: FolderKanban },
  { href: '/app/tasks', label: '任务跟踪', icon: ClipboardList },
  { href: '/app/progress', label: '完成进度', icon: BarChart3 },
  { href: '/app/income', label: '收入情况', icon: Coins },
  { href: '/app/articles', label: '每日文章', icon: FileText },
  { href: '/app/users', label: '用户权限', icon: ShieldCheck },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass-panel overflow-hidden rounded-[24px] p-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-112px)]">
      <div className="legacy-gradient hidden px-5 py-5 text-white lg:block">
        <div className="text-xs uppercase tracking-[0.2em] text-white/64">Admin Console</div>
        <div className="serif-heading mt-2 text-2xl">实盘录入后台</div>
        <div className="mt-2 text-xs leading-6 text-white/68">收入、任务、文章每天轻量录入。</div>
      </div>

      <nav className="flex gap-2 overflow-x-auto p-2 lg:block lg:space-y-1.5 lg:overflow-visible lg:p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-[16px] px-4 py-3 text-sm transition',
                isActive
                  ? 'legacy-gradient text-white shadow-lg shadow-indigo-900/12'
                  : 'bg-white/45 text-[var(--foreground)]/78 hover:bg-white/80 lg:bg-transparent',
              )}
            >
              <Icon size={18} />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
