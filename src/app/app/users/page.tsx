import { UserRoleManager } from '@/components/app/forms';
import { SectionHeader } from '@/components/app/section-header';
import { getProfiles } from '@/lib/data/queries';

export default async function UsersPage() {
  const profiles = await getProfiles();

  return (
    <div className="space-y-5">
      <SectionHeader title="伙伴权限" description="管理谁可以查看完整复盘正文，保持内容区和账号权限一致。" />
      <UserRoleManager profiles={profiles} />
    </div>
  );
}
