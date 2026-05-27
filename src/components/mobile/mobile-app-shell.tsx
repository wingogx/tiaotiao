'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { BarChart3, Bell, BookOpen, Compass, PawPrint, Target, UserRound, Zap } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

type MobileAppShellProps = {
  children: ReactNode;
  accountLabel?: string;
};

const tabs = [
  {
    href: '/',
    label: '首页',
    eyebrow: '挑战舱',
    icon: PawPrint,
    match: (pathname: string) => pathname === '/',
  },
  {
    href: '/app/progress',
    label: '进度',
    eyebrow: '目标追踪',
    icon: Target,
    match: (pathname: string) => pathname.startsWith('/app/progress'),
  },
  {
    href: '/app/projects',
    label: '项目',
    eyebrow: '收入来源',
    icon: Compass,
    match: (pathname: string) => pathname.startsWith('/app/projects'),
  },
  {
    href: '/articles',
    label: '复盘',
    eyebrow: '每日文章',
    icon: BookOpen,
    match: (pathname: string) => pathname.startsWith('/articles') || pathname.startsWith('/app/articles'),
  },
  {
    href: '/app/today?tab=tasks',
    label: '录入',
    eyebrow: '今日行动',
    icon: Zap,
    match: (pathname: string) => pathname.startsWith('/app/today'),
  },
  {
    href: '/me',
    label: '我的',
    eyebrow: '账户中心',
    icon: UserRound,
    match: (pathname: string) => pathname.startsWith('/me') || pathname.startsWith('/login') || pathname.startsWith('/register'),
  },
];

const routeLabels = [
  ...tabs,
  {
    label: '任务',
    eyebrow: '任务跟踪',
    match: (pathname: string) => pathname.startsWith('/app/tasks'),
  },
  {
    label: '收入',
    eyebrow: '收入情况',
    match: (pathname: string) => pathname.startsWith('/app/income'),
  },
  {
    label: '权限',
    eyebrow: '用户管理',
    match: (pathname: string) => pathname.startsWith('/app/users'),
  },
];

export function MobileAppShell({ children, accountLabel = '我的' }: MobileAppShellProps) {
  const pathname = usePathname();
  const current = routeLabels.find((item) => item.match(pathname)) ?? tabs[0];

  return (
    <div className="mobile-app-shell min-h-screen text-[var(--neko-ink)]">
      <header className="mobile-app-topbar sticky top-0 z-40 border-b border-[var(--neko-line)] bg-white/82 backdrop-blur-2xl">
        <div className="mx-auto flex h-[76px] w-full max-w-[900px] items-center gap-3 px-4">
          <Link href="/" className="legacy-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] text-white shadow-[0_12px_28px_rgba(201,101,113,0.22)]">
            <BarChart3 size={22} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--neko-muted)]">{current.eyebrow}</div>
            <div className="truncate text-xl font-black leading-tight text-[var(--neko-ink)]">{current.label}</div>
          </div>
          <Link href="/me" aria-label="账户中心" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--neko-line)] bg-white/76 text-[var(--neko-brown)] shadow-sm">
            <Bell size={20} />
          </Link>
          <Link href="/me" aria-label="我的" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7dfe4] text-sm font-black text-[var(--neko-red)] shadow-sm">
            {accountLabel.slice(0, 1).toUpperCase()}
          </Link>
        </div>
      </header>

      <main className="mobile-app-content mx-auto w-full max-w-[900px] px-4 pb-[132px] pt-4">
        {children}
      </main>

      <nav className="mobile-tabbar">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-[22px] px-2 py-3 text-[11px] font-black transition',
                active ? 'bg-[#f7dfe4] text-[var(--neko-red)]' : 'text-[var(--neko-brown)] hover:bg-white/70',
              )}
            >
              <Icon size={24} strokeWidth={active ? 2.7 : 2.2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
