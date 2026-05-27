import Link from 'next/link';
import { BookOpen, ChevronRight, Orbit, Sparkles } from 'lucide-react';

import type { AwaitedReturn } from '@/types/common';
import { formatDate } from '@/lib/utils/format';

type DashboardData = AwaitedReturn<typeof import('@/lib/data/queries').getDashboardData>;

export function ArticlePreview({ data }: { data: DashboardData }) {
  const featured = data.posts[0];
  const rest = data.posts.slice(1, 5);

  return (
    <section className="page-shell py-4">
      <div className="neko-section overflow-hidden p-6 md:p-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="neko-chip text-xs font-bold uppercase tracking-[0.16em]">
              <Orbit size={17} /> Memory Star Map
            </div>
            <h2 className="mt-4 text-3xl font-black text-[var(--neko-ink)]">记忆星图：最近的复盘碎片</h2>
          </div>
          <Link href="/articles" className="inline-flex items-center gap-2 rounded-full border border-[var(--neko-line)] bg-white/58 px-5 py-3 text-sm font-bold text-[var(--neko-red)] transition hover:bg-white">
            查看全部记忆 <ChevronRight size={17} />
          </Link>
        </div>

        {data.posts.length === 0 ? (
          <div className="rounded-[26px] border border-dashed border-[var(--neko-line)] bg-white/48 px-5 py-10 text-sm leading-7 text-[var(--neko-muted)]">
            文章还没开始发布。第一篇复盘写下后，会自动生成 Lumia 的第一颗记忆节点。
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_1.12fr]">
            {featured ? (
              <Link href={`/articles/${featured.slug}`} className="group relative min-h-[360px] overflow-hidden rounded-[28px] border border-[var(--neko-line)] bg-[linear-gradient(135deg,rgba(255,240,222,0.9),rgba(248,220,225,0.82))] p-7 shadow-[0_18px_44px_rgba(111,72,63,0.08)]">
                <div className="absolute right-8 top-8 flex h-20 w-20 items-center justify-center rounded-full bg-white/56 text-[var(--neko-red)]">
                  <Sparkles size={34} />
                </div>
                <div className="neko-chip w-fit text-xs font-bold uppercase tracking-[0.14em]">主记忆</div>
                <h3 className="mt-8 max-w-[420px] text-4xl font-black leading-tight text-[var(--neko-ink)]">{featured.title}</h3>
                <p className="mt-5 max-w-[420px] text-base leading-8 text-[var(--neko-brown)]">{featured.excerpt}</p>
                <div className="absolute bottom-7 left-7 flex items-center gap-3 text-sm font-bold text-[var(--neko-red)]">
                  <BookOpen size={18} /> {formatDate(featured.post_date)}
                </div>
              </Link>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              {rest.map((post, index) => (
                <Link key={post.id} href={`/articles/${post.slug}`} className="group rounded-[26px] border border-[var(--neko-line)] bg-white/56 p-5 transition hover:-translate-y-1 hover:bg-white">
                  <div className="mb-5 flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-[var(--neko-muted)]">
                    <span>Memory {String(index + 2).padStart(2, '0')}</span>
                    <span>{formatDate(post.post_date)}</span>
                  </div>
                  <div className="text-xl font-black leading-8 text-[var(--neko-ink)]">{post.title}</div>
                  <div className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--neko-muted)]">{post.excerpt}</div>
                </Link>
              ))}

              {rest.length < 4
                ? Array.from({ length: 4 - rest.length }).map((_, index) => (
                    <div key={`empty-${index}`} className="rounded-[26px] border border-dashed border-[var(--neko-line)] bg-white/32 p-5 text-sm leading-7 text-[var(--neko-muted)]">
                      等待新的复盘记忆。
                    </div>
                  ))
                : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
