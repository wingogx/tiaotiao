import { MessageCircle, Trash2 } from 'lucide-react';

import { createPostComment, hidePostComment } from '@/app/actions';
import type { PostComment } from '@/lib/data/queries';
import { formatDate } from '@/lib/utils/format';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';

export function PostComments({
  canComment,
  comments,
  isAdmin,
  postId,
  slug,
}: {
  canComment: boolean;
  comments: PostComment[];
  isAdmin: boolean;
  postId: string;
  slug: string;
}) {
  return (
    <section className="rounded-[30px] border border-[var(--neko-line)] bg-white/78 p-5 shadow-[0_14px_38px_rgba(93,65,57,0.08)]">
      <div className="mb-5 flex items-center gap-2 text-lg font-black text-[var(--neko-ink)]">
        <MessageCircle size={20} className="text-[var(--neko-red)]" />
        围观留言
      </div>

      {canComment ? (
        <form action={createPostComment} className="mb-5 space-y-3">
          <input type="hidden" name="postId" value={postId} />
          <input type="hidden" name="slug" value={slug} />
          <Textarea name="body" className="min-h-24" placeholder="写下你的围观感受，避免荐股、广告、拉群或引导转账。" required />
          <Button className="h-11 rounded-[18px] font-black">发布留言</Button>
        </form>
      ) : (
        <div className="mb-5 rounded-[22px] border border-dashed border-[var(--neko-line)] bg-white/55 px-4 py-4 text-sm leading-7 text-[var(--neko-muted)]">
          登录并开通正文权限后，可以在复盘下留言。
        </div>
      )}

      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-[var(--neko-line)] bg-white/50 px-4 py-5 text-sm text-[var(--neko-muted)]">
            还没有留言。
          </div>
        ) : (
          comments.map((comment) => {
            const author = comment.profiles?.display_name ?? comment.profiles?.email ?? '围观伙伴';

            return (
              <div key={comment.id} className="rounded-[22px] border border-[var(--neko-line)] bg-white/64 px-4 py-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black text-[var(--neko-ink)]">{author}</div>
                    <div className="mt-1 text-xs text-[var(--neko-muted)]">{formatDate(comment.created_at)}</div>
                  </div>
                  {isAdmin ? (
                    <form action={hidePostComment}>
                      <input type="hidden" name="commentId" value={comment.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <button type="submit" className="rounded-full p-2 text-[var(--neko-muted)] transition hover:bg-red-50 hover:text-[var(--danger)]" aria-label="隐藏留言">
                        <Trash2 size={15} />
                      </button>
                    </form>
                  ) : null}
                </div>
                <p className="whitespace-pre-line text-sm leading-7 text-[var(--neko-brown)]">{comment.body}</p>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
