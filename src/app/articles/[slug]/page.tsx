import { notFound } from 'next/navigation';

import { PostDetail } from '@/components/articles/post-detail';
import { MobileAppShell } from '@/components/mobile/mobile-app-shell';
import { getViewerAccess } from '@/lib/auth/session';
import { getPostBySlug } from '@/lib/data/queries';

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, viewer] = await Promise.all([getPostBySlug(slug), getViewerAccess()]);

  if (!post) {
    notFound();
  }

  const accountLabel = viewer.profile?.display_name ?? viewer.profile?.email ?? '我';

  return (
    <MobileAppShell accountLabel={accountLabel}>
      <PostDetail post={post} canViewContent={viewer.canViewArticles} shell={false} />
    </MobileAppShell>
  );
}
