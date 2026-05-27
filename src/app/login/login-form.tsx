'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, HelpCircle, Lock, Mail } from 'lucide-react';

import { signInWithMagicLink } from '@/app/actions';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

import { MobileAppShell } from '@/components/mobile/mobile-app-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState(searchParams.get('email') ?? '4317376@qq.com');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(searchParams.get('error') ?? '');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [mode, setMode] = React.useState<'password' | 'magic'>(searchParams.get('mode') === 'magic' ? 'magic' : 'password');
  const sent = searchParams.get('sent') === '1';
  const nextPath = searchParams.get('next') ?? '/app/today';

  const handlePasswordLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });

      if (loginError) {
        setError(loginError.message === 'Invalid login credentials' ? '邮箱或密码不正确' : loginError.message);
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : '登录失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileAppShell accountLabel="我">
      <div className="mx-auto max-w-[560px] space-y-5">
        <section className="legacy-gradient relative overflow-hidden rounded-[34px] px-6 py-8 text-white shadow-[0_24px_70px_rgba(201,101,113,0.2)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.26),transparent_30%)]" />
          <div className="relative">
            <div className="inline-flex rounded-full border border-white/18 bg-white/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/78">Member Gate</div>
            <h1 className="mt-5 text-4xl font-black leading-tight">回到挑战舱</h1>
            <p className="mt-3 text-sm leading-7 text-white/76">登录后进入复盘记忆、今日行动和挑战数据。所有内容继续保持 1000 天实盘记录。</p>
          </div>
        </section>

        <Card className="rounded-[32px] border-[var(--neko-line)] bg-white/78 p-5 shadow-[0_14px_38px_rgba(93,65,57,0.08)] backdrop-blur-xl">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#f7dfe4] text-[var(--neko-red)]">
                <BookOpen size={22} />
              </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-[var(--neko-muted)]">Account Access</p>
            <h2 className="mt-3 text-3xl font-black text-[var(--neko-ink)]">登录账号</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--neko-muted)]">管理员可进入行动页；会员可查看完整复盘记忆。</p>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-1 rounded-[22px] border border-[var(--neko-line)] bg-[#f4ece7] p-1">
            <button
              type="button"
              onClick={() => setMode('password')}
              className={`flex h-11 items-center justify-center gap-2 rounded-[18px] text-sm font-black transition ${mode === 'password' ? 'bg-[var(--neko-red)] text-white shadow-sm' : 'text-[var(--neko-brown)] hover:bg-white/70'}`}
            >
              <Lock size={16} />
              登录
            </button>
            <Link className="flex h-11 items-center justify-center gap-2 rounded-[18px] text-sm font-black text-[var(--neko-brown)] transition hover:bg-white/70" href="/register">
              <Mail size={16} />
              注册
            </Link>
            <button
              type="button"
              onClick={() => setMode('magic')}
              className={`flex h-11 items-center justify-center gap-2 rounded-[18px] text-sm font-black transition ${mode === 'magic' ? 'bg-[var(--neko-red)] text-white shadow-sm' : 'text-[var(--neko-brown)] hover:bg-white/70'}`}
            >
              <HelpCircle size={16} />
              链接
            </button>
          </div>

          {error ? <div className="mt-5 rounded-[22px] border border-[#d9a38d] bg-[#fff1ea] px-4 py-3 text-sm text-[#8c3e21]">{error}</div> : null}
          {sent ? <div className="mt-5 rounded-[22px] border border-[#9fcbb7] bg-[#eef8f2] px-4 py-3 text-sm text-[#255f47]">登录链接已发送，请查收邮箱。</div> : null}

          {mode === 'password' ? (
            <form className="mt-7 space-y-5" onSubmit={handlePasswordLogin}>
              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--neko-brown)]" htmlFor="login-email">
                  <Mail size={16} className="text-[var(--neko-red)]" />
                  邮箱
                </label>
                <Input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--neko-brown)]" htmlFor="login-password">
                  <Lock size={16} className="text-[var(--neko-red)]" />
                  密码
                </label>
                <Input id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="输入密码" />
              </div>
              <Button fullWidth disabled={isSubmitting} className="h-12 rounded-[20px] text-base font-black">
                {isSubmitting ? '登录中...' : '进入挑战舱'}
              </Button>
            </form>
          ) : (
            <form action={signInWithMagicLink} className="mt-7 space-y-5">
              <input type="hidden" name="next" value="/articles" />
              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--neko-brown)]" htmlFor="magic-email">
                  <Mail size={16} className="text-[var(--neko-red)]" />
                  邮箱链接登录
                </label>
                <Input id="magic-email" name="email" type="email" placeholder="输入邮箱地址" required />
              </div>
              <Button fullWidth variant="secondary" className="h-12 rounded-[20px] font-black">发送登录链接</Button>
            </form>
          )}
        </Card>
      </div>
    </MobileAppShell>
  );
}
