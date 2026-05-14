import Image from 'next/image';
import Link from 'next/link';

import type { DailyPost } from '@/lib/data/queries';
import { formatDate } from '@/lib/utils/format';

import { EmptyState } from '@/components/app/admin-ui';
import { Card } from '@/components/ui/card';

export function PostList({ posts, basePath = '/articles' }: { posts: DailyPost[]; basePath?: string }) {
  if (posts.length === 0) {
    return <EmptyState>还没有文章。发布第一篇复盘后，这里会自动展示。</EmptyState>;
  }

  return (
    <div className="grid gap-5">
      {posts.map((post) => (
        <Link key={post.id} href={`${basePath}/${post.slug}`}>
          <Card className="grid gap-5 rounded-[24px] p-4 transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(37,48,68,0.1)] md:grid-cols-[220px_1fr] md:p-5">
            <div className="relative h-52 overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,var(--accent),var(--secondary))]">
              {post.cover_url ? (
                <Image src={post.cover_url} alt={post.title} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-end bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_45%)] p-5 text-white/78">
                  {formatDate(post.post_date)}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between gap-4 py-1">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{formatDate(post.post_date)}</div>
                <h2 className="serif-heading mt-3 text-2xl leading-tight text-[var(--foreground)] md:text-3xl">{post.title}</h2>
                <p className="mt-4 text-sm leading-8 text-[var(--muted)]">{post.excerpt}</p>
              </div>

              <div className="text-sm font-medium text-[var(--accent)]">查看文章正文</div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
