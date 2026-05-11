import Link from 'next/link';
import { BarChart3, ClipboardList, Coins, FileText, FolderKanban, LayoutDashboard, ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

const items = [
  { href: '/app/today', label: '今日录入', icon: LayoutDashboard },
  { href: '/app/projects', label: '项目看板', icon: FolderKanban },
  { href: '/app/tasks', label: '任务跟踪', icon: ClipboardList },
  { href: '/app/progress', label: '完成进度', icon: BarChart3 },
  { href: '/app/income', label: '收入情况', icon: Coins },
  { href: '/articles', label: '每日文章', icon: FileText },
  { href: '/app/users', label: '用户权限', icon: ShieldCheck },
];

export function AppSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="glass-panel hidden min-h-[calc(100vh-112px)] overflow-hidden rounded-[28px] p-0 lg:block">
      <div className="legacy-gradient px-5 py-6 text-white">
        <div className="text-xs uppercase tracking-[0.2em] text-white/64">Admin Console</div>
        <div className="serif-heading mt-2 text-2xl">实盘录入后台</div>
        <div className="mt-2 text-xs leading-6 text-white/68">收入、任务、文章每天轻量录入。</div>
      </div>

      <nav className="space-y-2 p-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm transition',
                isActive
                  ? 'legacy-gradient text-white shadow-lg shadow-indigo-900/12'
                  : 'text-[var(--foreground)]/78 hover:bg-white/80',
              )}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
