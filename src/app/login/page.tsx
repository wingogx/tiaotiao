import Link from 'next/link';

import { signInWithMagicLink } from '@/app/actions';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const sent = params.sent === '1';
  const email = typeof params.email === 'string' ? params.email : '';
  const next = typeof params.next === 'string' ? params.next : '/articles';

  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="page-shell py-12">
        <Card className="mx-auto max-w-2xl rounded-[36px] p-7 md:p-10">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Member Access</div>
          <h1 className="serif-heading mt-3 text-4xl text-[var(--foreground)]">邮箱登录即可，权限由管理员手动开通。</h1>
          <p className="mt-4 text-sm leading-8 text-[var(--muted)]">
            第一版不做支付。任何人都可以提交邮箱获取登录链接，但只有被授权的账号才能查看会员正文内容。
          </p>

          {sent ? (
            <div className="mt-6 rounded-[24px] border border-[var(--border)] bg-white/75 px-5 py-4 text-sm text-[var(--foreground)]">
              登录邮件已经发送到 <span className="font-semibold">{email}</span>，请在邮箱里点击链接完成登录。
            </div>
          ) : null}

          <form action={signInWithMagicLink} className="mt-8 space-y-4">
            <input type="hidden" name="next" value={next} />
            <Input name="email" type="email" placeholder="输入邮箱地址" required />
            <Button fullWidth>发送登录链接</Button>
          </form>

          <div className="mt-6 text-sm text-[var(--muted)]">
            还没拿到权限？先回到 <Link href="/" className="text-[var(--accent)]">公开首页</Link> 看最新动态和文章标题。
          </div>
        </Card>
      </main>
    </div>
  );
}
