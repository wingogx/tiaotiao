import { notFound } from 'next/navigation';

import { PostDetail } from '@/components/articles/post-detail';
import { PostComments } from '@/components/articles/post-comments';
import { getViewerAccess } from '@/lib/auth/session';
import { getPostBySlug, getPostComments } from '@/lib/data/queries';

export default async function AppArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, viewer] = await Promise.all([getPostBySlug(slug), getViewerAccess()]);

  if (!post) {
    notFound();
  }

  const comments = await getPostComments(post.id);

  return (
    <div className="space-y-5">
      <PostDetail post={post} canViewContent={viewer.canViewArticles || viewer.isAdmin} shell={false} />
      <PostComments comments={comments} canComment={viewer.canViewArticles || viewer.isAdmin} isAdmin={viewer.isAdmin} postId={post.id} slug={slug} />
    </div>
  );
}
