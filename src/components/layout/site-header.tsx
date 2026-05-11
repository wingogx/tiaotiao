import Link from 'next/link';
import { BarChart3 } from 'lucide-react';

import { getViewerAccess } from '@/lib/auth/session';

import { Button } from '@/components/ui/button';

export async function SiteHeader() {
  const viewer = await getViewerAccess();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/88 shadow-sm backdrop-blur-xl">
      <div className="page-shell flex h-18 items-center justify-between gap-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-sm text-[var(--muted)]">
          <div className="legacy-gradient flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg shadow-indigo-900/15">
            <BarChart3 size={21} />
          </div>
          <div>
            <div className="serif-heading text-lg font-semibold text-[var(--foreground)]">1000天赚1000万</div>
            <div className="text-xs">实盘跟踪日记</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex">
          <Link href="/">首页</Link>
          <Link href="/app/projects">项目看板</Link>
          <Link href="/app/tasks">任务跟踪</Link>
          <Link href="/app/progress">完成进度</Link>
          <Link href="/app/income">收入情况</Link>
          <Link href={viewer.isAdmin ? '/app/articles' : '/articles'}>每日文章</Link>
          {viewer.isAdmin ? <Link href="/app/today">今日录入</Link> : null}
        </nav>

        <div className="flex items-center gap-3">
          {viewer.profile ? (
            <Link href={viewer.isAdmin ? '/app/today' : '/articles'}>
              <Button variant="secondary">{viewer.isAdmin ? '进入后台' : '进入会员区'}</Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="secondary">登录</Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button>注册</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
