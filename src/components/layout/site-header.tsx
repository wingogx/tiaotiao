import Link from 'next/link';

import { getViewerAccess } from '@/lib/auth/session';

import { Button } from '@/components/ui/button';

export async function SiteHeader() {
  const viewer = await getViewerAccess();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[#f7f1e7]/85 backdrop-blur-xl">
      <div className="page-shell flex h-18 items-center justify-between gap-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-sm text-[var(--muted)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-lg text-white shadow-lg shadow-emerald-950/10">
            10
          </div>
          <div>
            <div className="serif-heading text-lg font-semibold text-[var(--foreground)]">1000天赚1000万</div>
            <div className="text-xs">实盘跟踪日记</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex">
          <Link href="/">首页</Link>
          <Link href="/articles">每日文章</Link>
          {viewer.isAdmin ? <Link href="/app/today">后台</Link> : null}
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
