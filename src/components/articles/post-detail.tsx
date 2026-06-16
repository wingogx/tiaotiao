import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { DailyPost } from '@/lib/data/queries';
import { getPostTypeLabel } from '@/lib/data/queries';
import { formatDate } from '@/lib/utils/format';

import { RiskNotice } from '@/components/common/risk-notice';
import { Card } from '@/components/ui/card';

export function PostDetail({ post, canViewContent, shell = true }: { post: DailyPost; canViewContent: boolean; shell?: boolean }) {
  const content = (
    <Card className="overflow-hidden rounded-[32px] border-[var(--neko-line)] bg-white/78 p-0 shadow-[0_14px_38px_rgba(93,65,57,0.08)]">
      <div className="grid gap-6 p-5 md:grid-cols-[0.95fr_1.05fr] md:p-7">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#fff0de] px-3 py-1 text-xs font-bold text-[#e28e32]">{formatDate(post.post_date)}</span>
            <span className="rounded-full bg-[#f7dfe4] px-3 py-1 text-xs font-bold text-[var(--neko-red)]">{getPostTypeLabel(post.post_type)}</span>
          </div>
          <h1 className="text-4xl font-black leading-tight text-[var(--neko-ink)]">{post.title}</h1>
          <p className="text-sm leading-8 text-[var(--neko-muted)]">{post.excerpt}</p>
          <RiskNotice compact />
          <div className="relative min-h-[300px] overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,var(--neko-red),#eea13d)]">
            {post.cover_url ? (
              <Image src={post.cover_url} alt={post.title} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_38%)]" />
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-[var(--neko-line)] bg-white/72 p-5 md:p-7">
          {canViewContent ? (
            <div className="markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content_md}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex h-full flex-col justify-center rounded-[26px] border border-dashed border-[var(--neko-line)] bg-white/60 px-6 py-10 text-center">
              <div className="text-3xl font-black text-[var(--neko-ink)]">完整记忆仅对会员开放</div>
              <p className="mt-4 text-sm leading-8 text-[var(--neko-muted)]">
                公开版可看标题、日期、封面和摘要。开通正文权限后，可以查看完整复盘过程与留言区。
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
    <div className="mx-auto w-full max-w-[900px] px-4 py-5">
      {content}
    </div>
  );
}
