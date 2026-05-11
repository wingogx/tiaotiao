import Link from 'next/link';

import type { AwaitedReturn } from '@/types/common';
import { formatDate } from '@/lib/utils/format';

import { Card } from '@/components/ui/card';

type DashboardData = AwaitedReturn<typeof import('@/lib/data/queries').getDashboardData>;

export function ArticlePreview({ data }: { data: DashboardData }) {
  return (
    <section className="page-shell py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Latest Writing</div>
          <h2 className="serif-heading mt-2 text-3xl text-[var(--foreground)]">最近 5 篇公开标题</h2>
        </div>
        <Link href="/articles" className="text-sm text-[var(--accent)]">
          查看全部文章
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {data.posts.length === 0 ? (
          <Card className="lg:col-span-5">
            <div className="text-sm text-[var(--muted)]">文章还没开始发布。第一篇文章发出后，这里会自动展示最近标题。</div>
          </Card>
        ) : (
          data.posts.map((post, index) => (
            <Link key={post.id} href={`/articles/${post.slug}`}>
              <Card className="flex h-full flex-col gap-4 rounded-[28px] p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_42px_rgba(16,52,44,0.12)]">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  <span>#{String(index + 1).padStart(2, '0')}</span>
                  <span>{formatDate(post.post_date)}</span>
                </div>
                <div className="serif-heading text-xl leading-8 text-[var(--foreground)]">{post.title}</div>
                <div className="mt-auto text-sm leading-7 text-[var(--muted)]">{post.excerpt}</div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
