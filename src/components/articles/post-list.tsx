import Image from 'next/image';
import Link from 'next/link';

import type { DailyPost } from '@/lib/data/queries';
import { getPostTypeLabel } from '@/lib/data/queries';
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
          <Card className="grid gap-5 rounded-[30px] border-[var(--neko-line)] bg-white/78 p-4 shadow-[0_14px_38px_rgba(93,65,57,0.08)] transition hover:-translate-y-0.5 hover:bg-white sm:grid-cols-[180px_1fr] sm:p-5">
            <div className="relative h-52 overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,var(--neko-red),#eea13d)] sm:h-full">
              {post.cover_url ? (
                <Image src={post.cover_url} alt={post.title} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-end bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),transparent_45%)] p-5 text-sm font-bold text-white/82">
                  复盘记忆 · {formatDate(post.post_date)}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between gap-4 py-1">
              <div>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-[#fff0de] px-3 py-1 text-[#e28e32]">{formatDate(post.post_date)}</span>
                  <span className="rounded-full bg-[#f7dfe4] px-3 py-1 text-[var(--neko-red)]">{getPostTypeLabel(post.post_type)}</span>
                </div>
                <h2 className="mt-3 text-2xl font-black leading-tight text-[var(--neko-ink)]">{post.title}</h2>
                <p className="mt-4 text-sm leading-8 text-[var(--neko-muted)]">{post.excerpt}</p>
              </div>

              <div className="text-sm font-black text-[var(--neko-red)]">打开复盘</div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
