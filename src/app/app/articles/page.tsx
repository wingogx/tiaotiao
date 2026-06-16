import { SectionHeader } from '@/components/app/section-header';
import { AdminPostList } from '@/components/articles/admin-post-list';
import { getPosts } from '@/lib/data/queries';

export default async function AppArticlesPage() {
  const posts = await getPosts();

  return (
    <div className="space-y-5">
      <SectionHeader
        title="复盘日记"
        description="查看已发布的复盘日记。公开区展示标题和摘要，完整过程按权限开放。"
      />
      <AdminPostList posts={posts} />
    </div>
  );
}
