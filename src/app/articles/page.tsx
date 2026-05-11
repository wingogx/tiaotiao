import { PostList } from '@/components/articles/post-list';
import { SiteHeader } from '@/components/layout/site-header';
import { getPosts } from '@/lib/data/queries';

export default async function ArticlesPage() {
  const posts = await getPosts();

  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="page-shell py-10">
        <div className="mb-8 max-w-2xl">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Daily Writing</div>
          <h1 className="serif-heading mt-3 text-4xl text-[var(--foreground)] md:text-5xl">文章标题和摘要公开，正文面向会员。</h1>
          <p className="mt-4 text-sm leading-8 text-[var(--muted)]">
            这里按时间倒序展示每天的复盘、判断、问题和收获。游客可以先看标题与摘要，会员登录后查看完整内容。
          </p>
        </div>

        <PostList posts={posts} />
      </main>
    </div>
  );
}
