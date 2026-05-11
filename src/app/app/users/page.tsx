import { UserRoleManager } from '@/components/app/forms';
import { SectionHeader } from '@/components/app/section-header';
import { getProfiles } from '@/lib/data/queries';

export default async function UsersPage() {
  const profiles = await getProfiles();

  return (
    <div>
      <SectionHeader title="用户权限" description="第一版只有一个 admin。其他邮箱登录后默认没有正文权限，由你在这里手动授权。" />
      <UserRoleManager profiles={profiles} />
    </div>
  );
}
