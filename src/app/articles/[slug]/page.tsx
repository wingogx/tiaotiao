import { notFound } from 'next/navigation';

import { PostDetail } from '@/components/articles/post-detail';
import { PostComments } from '@/components/articles/post-comments';
import { MobileAppShell } from '@/components/mobile/mobile-app-shell';
import { getViewerAccess } from '@/lib/auth/session';
import { getPostBySlug, getPostComments } from '@/lib/data/queries';

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, viewer] = await Promise.all([getPostBySlug(slug), getViewerAccess()]);

  if (!post) {
    notFound();
  }

  const comments = await getPostComments(post.id);
  const accountLabel = viewer.profile?.display_name ?? viewer.profile?.email ?? '我';
  const canComment = viewer.canViewArticles || viewer.isAdmin;

  return (
    <MobileAppShell accountLabel={accountLabel}>
      <div className="space-y-5">
        <PostDetail post={post} canViewContent={viewer.canViewArticles || viewer.isAdmin} shell={false} />
        <PostComments comments={comments} canComment={canComment} isAdmin={viewer.isAdmin} postId={post.id} slug={slug} />
      </div>
    </MobileAppShell>
  );
}
