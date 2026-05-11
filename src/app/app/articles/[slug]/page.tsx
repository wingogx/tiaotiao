import { notFound } from 'next/navigation';

import { PostDetail } from '@/components/articles/post-detail';
import { getViewerAccess } from '@/lib/auth/session';
import { getPostBySlug } from '@/lib/data/queries';

export default async function AppArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, viewer] = await Promise.all([getPostBySlug(slug), getViewerAccess()]);

  if (!post) {
    notFound();
  }

  return <PostDetail post={post} canViewContent={viewer.canViewArticles} shell={false} />;
}
