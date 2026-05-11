import Image from 'next/image';
import Link from 'next/link';

import type { DailyPost } from '@/lib/data/queries';
import { formatDate } from '@/lib/utils/format';

import { Card } from '@/components/ui/card';

export function PostList({ posts }: { posts: DailyPost[] }) {
  return (
    <div className="grid gap-5">
      {posts.map((post) => (
        <Link key={post.id} href={`/articles/${post.slug}`}>
          <Card className="grid gap-5 rounded-[30px] p-4 md:grid-cols-[240px_1fr] md:p-5">
            <div className="relative h-56 overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#0f6b5a,#1e352d)]">
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
                <h2 className="serif-heading mt-3 text-3xl leading-tight text-[var(--foreground)]">{post.title}</h2>
                <p className="mt-4 text-sm leading-8 text-[var(--muted)]">{post.excerpt}</p>
              </div>

              <div className="text-sm font-medium text-[var(--accent)]">游客可见摘要，会员可查看正文</div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
