'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { HelpCircle, Lock, Mail, X } from 'lucide-react';

import { signInWithMagicLink } from '@/app/actions';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

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
    <div className="relative min-h-screen overflow-hidden bg-[#06110d] px-4 py-8 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(58,190,158,0.24),transparent_34%),linear-gradient(180deg,#06110d_0%,#10231d_50%,#1c3027_100%)]" />
      <div className="pointer-events-none absolute left-[-12rem] top-[22%] h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-[-10rem] right-[-10rem] h-[32rem] w-[32rem] rounded-full bg-amber-400/10 blur-[150px]" />

      <main className="relative mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[520px] items-center">
        <Card className="w-full rounded-[34px] border-white/10 bg-[#14241d]/88 p-7 text-white shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl md:p-9">
          <Link
            href="/"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-white/60 transition hover:bg-white/14 hover:text-white"
            aria-label="回到首页"
          >
            <X size={18} />
          </Link>

          <div className="mt-2 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-emerald-300/35 bg-[radial-gradient(circle_at_35%_24%,rgba(45,212,191,0.42),rgba(15,42,32,0.92)_58%)] text-3xl shadow-[0_0_34px_rgba(45,212,191,0.22)]">
              10
            </div>
            <p className="mt-7 text-[12px] font-semibold uppercase tracking-[0.35em] text-emerald-300/75">Member Access</p>
            <h1 className="serif-heading mt-3 text-3xl font-bold tracking-[0.04em] text-emerald-100">登录 1000 天实盘</h1>
            <p className="mt-3 text-sm leading-7 text-slate-300/78">管理员用密码登录；普通会员可以注册账号，等待后台开通文章正文权限。</p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-1 rounded-[1.1rem] border border-white/10 bg-black/24 p-1">
            <button
              type="button"
              onClick={() => setMode('password')}
              className={`flex h-11 items-center justify-center gap-2 rounded-[0.9rem] text-sm font-semibold transition ${mode === 'password' ? 'bg-emerald-300/16 text-emerald-200' : 'text-slate-400 hover:text-emerald-100'}`}
            >
              <Lock size={16} />
              登录
            </button>
            <Link className="flex h-11 items-center justify-center gap-2 rounded-[0.9rem] text-sm font-semibold text-slate-400 transition hover:text-emerald-100" href="/register">
              <Mail size={16} />
              注册
            </Link>
            <button
              type="button"
              onClick={() => setMode('magic')}
              className={`flex h-11 items-center justify-center gap-2 rounded-[0.9rem] text-sm font-semibold transition ${mode === 'magic' ? 'bg-emerald-300/16 text-emerald-200' : 'text-slate-400 hover:text-emerald-100'}`}
            >
              <HelpCircle size={16} />
              链接
            </button>
          </div>

          {error ? <div className="mt-5 rounded-2xl border border-red-400/25 bg-red-950/35 px-4 py-3 text-sm text-red-100">{error}</div> : null}
          {sent ? <div className="mt-5 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">登录链接已发送，请查收邮箱。</div> : null}

          {mode === 'password' ? (
            <form className="mt-7 space-y-5" onSubmit={handlePasswordLogin}>
              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200" htmlFor="login-email">
                  <Mail size={16} className="text-emerald-300" />
                  邮箱
                </label>
                <Input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="border-white/10 bg-black/24 text-white placeholder:text-slate-500" />
              </div>
              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200" htmlFor="login-password">
                  <Lock size={16} className="text-emerald-300" />
                  密码
                </label>
                <Input id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="输入密码" className="border-white/10 bg-black/24 text-white placeholder:text-slate-500" />
              </div>
              <Button fullWidth disabled={isSubmitting} className="h-12 rounded-2xl bg-[linear-gradient(135deg,#34d399_0%,#0f766e_100%)] text-base font-bold text-white hover:brightness-110">
                {isSubmitting ? '登录中...' : '邮箱密码登录'}
              </Button>
            </form>
          ) : (
            <form action={signInWithMagicLink} className="mt-7 space-y-5">
              <input type="hidden" name="next" value="/articles" />
              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200" htmlFor="magic-email">
                  <Mail size={16} className="text-emerald-300" />
                  邮箱链接登录
                </label>
                <Input id="magic-email" name="email" type="email" placeholder="输入邮箱地址" required className="border-white/10 bg-black/24 text-white placeholder:text-slate-500" />
              </div>
              <Button fullWidth variant="secondary" className="h-12 rounded-2xl border-white/10 bg-white/8 text-white hover:bg-white/14">发送登录链接</Button>
            </form>
          )}
        </Card>
      </main>
    </div>
  );
}
