import Link from 'next/link';

import type { DailyPost } from '@/lib/data/queries';
import { formatDate } from '@/lib/utils/format';

import { AdminPanel, EmptyState, PanelHeading } from '@/components/app/admin-ui';

export function AdminPostList({ posts }: { posts: DailyPost[] }) {
  return (
    <AdminPanel>
      <PanelHeading title="文章列表" description="按发布时间倒序排列，点击标题进入正文详情。" />
      {posts.length === 0 ? (
        <EmptyState>还没有文章。发布第一篇复盘后，这里会自动展示。</EmptyState>
      ) : (
        <div className="divide-y divide-[var(--border)] overflow-hidden rounded-[18px] border border-[var(--border)] bg-white/70">
          {posts.map((post) => (
            <Link key={post.id} href={`/app/articles/${post.slug}`} className="grid gap-2 px-4 py-4 transition hover:bg-white md:grid-cols-[150px_1fr_auto] md:items-center">
              <div className="text-sm font-medium text-[var(--muted)]">{formatDate(post.post_date)}</div>
              <div className="min-w-0">
                <div className="truncate text-base font-semibold text-[var(--foreground)]">{post.title}</div>
                <div className="mt-1 line-clamp-1 text-sm text-[var(--muted)]">{post.excerpt}</div>
              </div>
              <div className="text-sm font-medium text-[var(--accent)]">查看</div>
            </Link>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}
