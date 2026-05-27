import { PostList } from '@/components/articles/post-list';
import { MobileAppShell } from '@/components/mobile/mobile-app-shell';
import { getViewerAccess } from '@/lib/auth/session';
import { getPosts } from '@/lib/data/queries';

export default async function ArticlesPage() {
  const [posts, viewer] = await Promise.all([getPosts(), getViewerAccess()]);
  const accountLabel = viewer.profile?.display_name ?? viewer.profile?.email ?? '我';

  return (
    <MobileAppShell accountLabel={accountLabel}>
      <div className="space-y-5">
        <section className="rounded-[32px] border border-[var(--neko-line)] bg-white/78 p-5 shadow-[0_14px_34px_rgba(93,65,57,0.08)] backdrop-blur-xl">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--neko-red)]">Daily Review</div>
          <h1 className="mt-3 text-3xl font-black leading-tight text-[var(--neko-ink)]">复盘流</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--neko-muted)]">
            按时间倒序查看每天的复盘、判断、问题和收获。游客可看标题与摘要，会员登录后查看完整内容。
          </p>
        </section>

        <PostList posts={posts} />
      </div>
    </MobileAppShell>
  );
}
