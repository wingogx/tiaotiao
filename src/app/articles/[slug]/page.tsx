import { notFound } from 'next/navigation';

import { PostDetail } from '@/components/articles/post-detail';
import { SiteHeader } from '@/components/layout/site-header';
import { getViewerAccess } from '@/lib/auth/session';
import { getPostBySlug } from '@/lib/data/queries';

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, viewer] = await Promise.all([getPostBySlug(slug), getViewerAccess()]);

  if (!post) {
    notFound();
  }

  return (
    <div className="pb-16">
      <SiteHeader />
      <PostDetail post={post} canViewContent={viewer.canViewArticles} />
    </div>
  );
}
