import Link from 'next/link';

import type { DailyPost } from '@/lib/data/queries';
import { getPostTypeLabel } from '@/lib/data/queries';
import { formatDate } from '@/lib/utils/format';

import { AdminPanel, EmptyState, PanelHeading } from '@/components/app/admin-ui';

export function AdminPostList({ posts }: { posts: DailyPost[] }) {
  return (
    <AdminPanel>
      <PanelHeading title="复盘日记列表" description="按发布时间倒序排列，点击卡片进入完整复盘。" />
      {posts.length === 0 ? (
        <EmptyState>还没有文章。发布第一篇复盘后，这里会自动展示。</EmptyState>
      ) : (
        <div className="grid gap-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/app/articles/${post.slug}`} className="grid gap-2 rounded-[24px] border border-[var(--neko-line)] bg-white/72 px-4 py-4 shadow-sm transition hover:bg-white sm:grid-cols-[112px_1fr_auto] sm:items-center">
              <div className="rounded-full bg-[#fff0de] px-3 py-1 text-center text-xs font-bold text-[#e28e32]">{formatDate(post.post_date)}</div>
              <div className="min-w-0">
                <div className="mb-1 w-fit rounded-full bg-[#f7dfe4] px-2.5 py-1 text-[11px] font-bold text-[var(--neko-red)]">{getPostTypeLabel(post.post_type)}</div>
                <div className="truncate text-base font-black text-[var(--neko-ink)]">{post.title}</div>
                <div className="mt-1 line-clamp-1 text-sm text-[var(--neko-muted)]">{post.excerpt}</div>
              </div>
              <div className="text-sm font-black text-[var(--neko-red)]">打开</div>
            </Link>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}
