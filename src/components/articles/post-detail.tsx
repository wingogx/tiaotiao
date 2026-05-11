import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { DailyPost } from '@/lib/data/queries';
import { formatDate } from '@/lib/utils/format';

import { Card } from '@/components/ui/card';

export function PostDetail({ post, canViewContent, shell = true }: { post: DailyPost; canViewContent: boolean; shell?: boolean }) {
  const content = (
    <Card className="overflow-hidden rounded-[30px] p-0">
      <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{formatDate(post.post_date)}</div>
          <h1 className="serif-heading text-4xl leading-tight text-[var(--foreground)] md:text-5xl">{post.title}</h1>
          <p className="text-sm leading-8 text-[var(--muted)]">{post.excerpt}</p>
          <div className="relative min-h-[340px] overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,var(--accent),var(--secondary))]">
            {post.cover_url ? (
              <Image src={post.cover_url} alt={post.title} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_38%)]" />
            )}
          </div>
        </div>

        <div className="rounded-[26px] border border-[var(--border)] bg-white/72 p-6 md:p-8">
          {canViewContent ? (
            <div className="markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content_md}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex h-full flex-col justify-center rounded-[24px] border border-dashed border-[var(--border)] bg-white/60 px-6 py-10 text-center">
              <div className="serif-heading text-3xl text-[var(--foreground)]">正文内容仅对会员开放</div>
              <p className="mt-4 text-sm leading-8 text-[var(--muted)]">
                现在可以先浏览标题、日期、封面和摘要。登录并获得会员权限后，即可查看完整复盘内容。
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  if (!shell) {
    return content;
  }

  return (
    <div className="page-shell py-10">
      {content}
    </div>
  );
}
