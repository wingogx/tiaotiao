import { PostList } from '@/components/articles/post-list';
import { SectionHeader } from '@/components/app/section-header';
import { getPosts } from '@/lib/data/queries';

export default async function AppArticlesPage() {
  const posts = await getPosts();

  return (
    <div>
      <SectionHeader
        title="每日文章"
        description="后台内查看已发布文章。标题和摘要公开，正文权限仍按会员/管理员规则控制。"
      />
      <PostList posts={posts} basePath="/app/articles" />
    </div>
  );
}
