'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, HelpCircle, Lock, Mail } from 'lucide-react';

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
    <div className="min-h-screen bg-[#f2eee5] text-[#1f2a28]">
      <main className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-[#22322f] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_32%),radial-gradient(circle_at_22%_18%,rgba(228,176,92,0.22),transparent_28%),radial-gradient(circle_at_80%_75%,rgba(97,161,140,0.28),transparent_34%)]" />
          <div className="relative flex items-center gap-3 text-sm text-white/72">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8b45b] font-semibold text-[#1f2a28]">10</div>
            <div>1000天赚1000万</div>
          </div>
          <div className="relative max-w-xl">
            <p className="text-xs uppercase tracking-[0.28em] text-[#e8b45b]">Private Journal</p>
            <h1 className="serif-heading mt-5 text-6xl leading-tight">真实记录，不做表演。</h1>
            <p className="mt-6 text-lg leading-9 text-white/72">登录后进入会员内容和后台。所有收入、任务、文章都围绕每日复盘整理，重点是长期可持续。</p>
          </div>
          <div className="relative grid grid-cols-3 gap-3 text-sm text-white/70">
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4">公开首页</div>
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4">会员文章</div>
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4">后台录入</div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-8">
          <Card className="w-full max-w-[520px] rounded-[28px] border-[#d8d0c0] bg-[#fffdf7] p-6 shadow-[0_24px_70px_rgba(49,45,35,0.12)] md:p-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#66706b] transition hover:text-[#1f2a28]">
              <ArrowLeft size={16} />
              返回首页
            </Link>

            <div className="mt-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#22322f] text-[#f7d38a]">
                <BookOpen size={22} />
              </div>
              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.24em] text-[#9b7142]">Member Access</p>
              <h1 className="serif-heading mt-3 text-4xl font-semibold text-[#1f2a28]">登录实盘记录</h1>
              <p className="mt-3 text-sm leading-7 text-[#66706b]">管理员用密码登录；普通会员可注册账号，等待后台开通文章正文权限。</p>
            </div>

          <div className="mt-8 grid grid-cols-3 gap-1 rounded-2xl border border-[#ded6c7] bg-[#eee8dc] p-1">
            <button
              type="button"
              onClick={() => setMode('password')}
              className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${mode === 'password' ? 'bg-[#22322f] text-white shadow-sm' : 'text-[#66706b] hover:text-[#1f2a28]'}`}
            >
              <Lock size={16} />
              登录
            </button>
            <Link className="flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-[#66706b] transition hover:text-[#1f2a28]" href="/register">
              <Mail size={16} />
              注册
            </Link>
            <button
              type="button"
              onClick={() => setMode('magic')}
              className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${mode === 'magic' ? 'bg-[#22322f] text-white shadow-sm' : 'text-[#66706b] hover:text-[#1f2a28]'}`}
            >
              <HelpCircle size={16} />
              链接
            </button>
          </div>

          {error ? <div className="mt-5 rounded-2xl border border-[#d9a38d] bg-[#fff1ea] px-4 py-3 text-sm text-[#8c3e21]">{error}</div> : null}
          {sent ? <div className="mt-5 rounded-2xl border border-[#9fcbb7] bg-[#eef8f2] px-4 py-3 text-sm text-[#255f47]">登录链接已发送，请查收邮箱。</div> : null}

          {mode === 'password' ? (
            <form className="mt-7 space-y-5" onSubmit={handlePasswordLogin}>
              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200" htmlFor="login-email">
                  <Mail size={16} className="text-[#9b7142]" />
                  邮箱
                </label>
                <Input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="border-[#ded6c7] bg-[#f7f2e8] text-[#1f2a28] placeholder:text-[#8f938d]" />
              </div>
              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#34413d]" htmlFor="login-password">
                  <Lock size={16} className="text-[#9b7142]" />
                  密码
                </label>
                <Input id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="输入密码" className="border-[#ded6c7] bg-[#f7f2e8] text-[#1f2a28] placeholder:text-[#8f938d]" />
              </div>
              <Button fullWidth disabled={isSubmitting} className="h-12 rounded-2xl bg-[#22322f] text-base font-bold text-white hover:bg-[#304640]">
                {isSubmitting ? '登录中...' : '邮箱密码登录'}
              </Button>
            </form>
          ) : (
            <form action={signInWithMagicLink} className="mt-7 space-y-5">
              <input type="hidden" name="next" value="/articles" />
              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#34413d]" htmlFor="magic-email">
                  <Mail size={16} className="text-[#9b7142]" />
                  邮箱链接登录
                </label>
                <Input id="magic-email" name="email" type="email" placeholder="输入邮箱地址" required className="border-[#ded6c7] bg-[#f7f2e8] text-[#1f2a28] placeholder:text-[#8f938d]" />
              </div>
              <Button fullWidth variant="secondary" className="h-12 rounded-2xl border-[#ded6c7] bg-[#f7f2e8] text-[#1f2a28] hover:bg-[#efe7d8]">发送登录链接</Button>
            </form>
          )}
        </Card>
        </section>
      </main>
    </div>
  );
}
