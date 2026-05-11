import Link from 'next/link';

import { signInWithMagicLink, signInWithPassword } from '@/app/actions';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const sent = params.sent === '1';
  const email = typeof params.email === 'string' ? params.email : '';
  const next = typeof params.next === 'string' ? params.next : '/articles';
  const error = typeof params.error === 'string' ? decodeURIComponent(params.error) : '';

  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="page-shell py-12">
        <Card className="mx-auto max-w-2xl rounded-[36px] p-7 md:p-10">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Member Access</div>
          <h1 className="serif-heading mt-3 text-4xl text-[var(--foreground)]">先登录，再由管理员决定你能看到什么。</h1>
          <p className="mt-4 text-sm leading-8 text-[var(--muted)]">
            第一版不做支付。管理员账号支持邮箱密码登录，其他用户仍可通过邮箱链接进入系统，正文权限由后台手动开放。
          </p>

          {error ? (
            <div className="mt-6 rounded-[24px] border border-[#d7b1a5] bg-[#fff1eb] px-5 py-4 text-sm text-[#8c3e21]">
              {error}
            </div>
          ) : null}

          <div className="mt-8 rounded-[28px] border border-[var(--border)] bg-white/70 p-5">
            <div className="mb-4 text-lg font-semibold text-[var(--foreground)]">管理员登录</div>
            <form action={signInWithPassword} className="space-y-4">
              <input type="hidden" name="next" value="/app/today" />
              <Input name="email" type="email" placeholder="管理员邮箱" required defaultValue="4317376@qq.com" />
              <Input name="password" type="password" placeholder="密码" required />
              <Button fullWidth>邮箱密码登录</Button>
            </form>
          </div>

          {sent ? (
            <div className="mt-6 rounded-[24px] border border-[var(--border)] bg-white/75 px-5 py-4 text-sm text-[var(--foreground)]">
              登录邮件已经发送到 <span className="font-semibold">{email}</span>，请在邮箱里点击链接完成登录。
            </div>
          ) : null}

          <form action={signInWithMagicLink} className="mt-8 space-y-4 rounded-[28px] border border-[var(--border)] bg-white/50 p-5">
            <div className="text-lg font-semibold text-[var(--foreground)]">会员链接登录</div>
            <input type="hidden" name="next" value={next} />
            <Input name="email" type="email" placeholder="输入邮箱地址" required />
            <Button fullWidth variant="secondary">发送登录链接</Button>
          </form>

          <div className="mt-6 text-sm text-[var(--muted)]">
            还没拿到权限？先回到 <Link href="/" className="text-[var(--accent)]">公开首页</Link> 看最新动态和文章标题。
          </div>
        </Card>
      </main>
    </div>
  );
}
