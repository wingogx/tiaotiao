'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { HelpCircle, Lock, Mail, ShieldCheck } from 'lucide-react';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type LoginMode = 'password' | 'forgot';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode: LoginMode = searchParams.get('mode') === 'forgot' ? 'forgot' : 'password';
  const [email, setEmail] = React.useState(searchParams.get('email') ?? '');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(searchParams.get('error') ?? '');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState(searchParams.get('email') ?? '');
  const [forgotError, setForgotError] = React.useState('');
  const [forgotSuccess, setForgotSuccess] = React.useState(false);
  const [isForgotSubmitting, setIsForgotSubmitting] = React.useState(false);
  const resetSuccess = searchParams.get('reset') === '1';
  const nextPath = searchParams.get('next') ?? '/app/today';

  const switchMode = React.useCallback(
    (nextMode: LoginMode) => {
      setError('');
      setForgotError('');

      const params = new URLSearchParams(searchParams.toString());
      if (nextMode === 'forgot') {
        params.set('mode', 'forgot');
      } else {
        params.delete('mode');
      }

      const query = params.toString();
      router.replace(query ? `/login?${query}` : '/login', { scroll: false });
    },
    [router, searchParams],
  );

  const handlePasswordLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

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

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setForgotError('');
    setIsForgotSubmitting(true);

    try {
      const targetEmail = forgotEmail.trim().toLowerCase();
      if (!targetEmail) {
        setForgotError('请输入邮箱');
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setForgotError(resetError.message);
        return;
      }

      setForgotSuccess(true);
    } catch (submitError) {
      setForgotError(submitError instanceof Error ? submitError.message : '暂时无法发送重置邮件，请稍后重试');
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={mode === 'forgot' ? (forgotSuccess ? '重置邮件已发送' : '找回密码') : '欢迎回来'}
      description={
        mode === 'forgot'
          ? '输入注册邮箱后，系统会发送一个重置链接。链接打开后可直接设置新密码。'
          : '选择您常用的登录方式，继续今天的挑战记录和复盘。'
      }
      brand="TIAOTIAO"
    >
      <div className="mt-9 grid grid-cols-3 gap-1 rounded-[1.1rem] border border-cyan-400/18 bg-[#070b12]/70 p-1">
        <button
          type="button"
          onClick={() => switchMode('password')}
          className={`flex h-11 items-center justify-center gap-2 rounded-[0.9rem] text-sm font-semibold transition ${
            mode === 'password'
              ? 'bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(37,99,235,0.28))] text-cyan-300 shadow-[inset_0_0_22px_rgba(34,211,238,0.08)]'
              : 'text-slate-400 hover:text-cyan-200'
          }`}
        >
          <Lock className="h-4 w-4" />
          密码登录
        </button>
        <Link
          className="flex h-11 items-center justify-center gap-2 rounded-[0.9rem] text-sm font-semibold text-slate-400 transition hover:text-cyan-200"
          href="/register"
        >
          <Mail className="h-4 w-4" />
          免费注册
        </Link>
        <button
          type="button"
          onClick={() => switchMode('forgot')}
          className={`flex h-11 items-center justify-center gap-2 rounded-[0.9rem] text-sm font-semibold transition ${
            mode === 'forgot'
              ? 'bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(37,99,235,0.28))] text-cyan-300 shadow-[inset_0_0_22px_rgba(34,211,238,0.08)]'
              : 'text-slate-400 hover:text-cyan-200'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          找回密码
        </button>
      </div>

      {resetSuccess ? (
        <div className="mt-6 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm leading-6 text-emerald-200">
          密码已重置，请使用新密码登录。
        </div>
      ) : null}

      {mode === 'password' ? (
        <>
          <form className="mt-7 space-y-5" onSubmit={handlePasswordLogin}>
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200" htmlFor="login-email">
                <Mail className="h-4 w-4 text-cyan-300" />
                用户名或邮箱
              </label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-12 rounded-xl border-cyan-400/18 bg-[#070b12]/84 px-4 text-[15px] text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-[#070b12] focus-visible:ring-cyan-400/30"
              />
            </div>

            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200" htmlFor="login-password">
                <ShieldCheck className="h-4 w-4 text-cyan-300" />
                密码
              </label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="输入密码"
                className="h-12 rounded-xl border-cyan-400/18 bg-[#070b12]/84 px-4 text-[15px] text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-[#070b12] focus-visible:ring-cyan-400/30"
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-red-400/30 bg-red-950/36 px-4 py-3 text-sm leading-6 text-red-200">{error}</div>
            ) : null}

            <Button
              fullWidth
              disabled={isSubmitting}
              className="h-14 rounded-2xl border-0 bg-[linear-gradient(135deg,#20c7d9_0%,#1d5dca_100%)] text-base font-bold tracking-[0.08em] text-white shadow-[0_16px_38px_rgba(29,93,202,0.34)] transition hover:brightness-110"
            >
              {isSubmitting ? '登录中...' : '登录'}
            </Button>

            <button
              type="button"
              onClick={() => switchMode('forgot')}
              className="w-full text-center text-sm font-semibold text-slate-400 transition hover:text-cyan-200"
            >
              忘记密码？
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            还没有账号？
            <Link className="ml-1 font-semibold text-cyan-300 transition hover:text-cyan-200" href="/register">
              免费注册
            </Link>
          </div>
        </>
      ) : forgotSuccess ? (
        <div className="mt-7 space-y-4">
          <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/8 px-4 py-4 text-sm leading-7 text-slate-300">
            如果 <span className="font-semibold text-cyan-300">{forgotEmail.trim()}</span> 是已注册邮箱，系统会发送重置密码邮件。请查收收件箱和垃圾箱。
          </div>
          <div className="rounded-2xl border border-cyan-400/15 bg-[#0f1723]/90 p-4 text-sm text-slate-300">
            <div className="flex items-center gap-2 font-medium text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              邮件重置流程
            </div>
            <p className="mt-2 leading-6 text-slate-400">邮件中的链接会带你进入设置新密码页面。设置完成后，返回登录页使用新密码登录即可。</p>
          </div>
          <Button
            fullWidth
            className="h-12 rounded-2xl border-0 bg-[linear-gradient(135deg,#20c7d9_0%,#1d5dca_100%)] text-base font-bold text-white shadow-[0_16px_38px_rgba(29,93,202,0.34)] hover:brightness-110"
            onClick={() => switchMode('password')}
            type="button"
          >
            返回登录
          </Button>
        </div>
      ) : (
        <>
          <form className="mt-7 space-y-5" onSubmit={handleForgotPassword}>
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200" htmlFor="forgot-email">
                <Mail className="h-4 w-4 text-cyan-300" />
                注册邮箱
              </label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={forgotEmail}
                onChange={(event) => setForgotEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-12 rounded-xl border-cyan-400/18 bg-[#070b12]/84 px-4 text-[15px] text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-[#070b12] focus-visible:ring-cyan-400/30"
              />
            </div>

            {forgotError ? (
              <div className="rounded-xl border border-red-400/30 bg-red-950/36 px-4 py-3 text-sm leading-6 text-red-200">{forgotError}</div>
            ) : null}

            <Button
              fullWidth
              disabled={isForgotSubmitting}
              className="h-14 rounded-2xl border-0 bg-[linear-gradient(135deg,#20c7d9_0%,#1d5dca_100%)] text-base font-bold tracking-[0.08em] text-white shadow-[0_16px_38px_rgba(29,93,202,0.34)] transition hover:brightness-110"
            >
              {isForgotSubmitting ? '发送中...' : '发送重置邮件'}
            </Button>
          </form>

          <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-[#0f1723]/90 p-4 text-sm text-slate-300">
            <div className="flex items-center gap-2 font-medium text-white">
              <HelpCircle className="h-4 w-4 text-cyan-300" />
              使用说明
            </div>
            <p className="mt-2 leading-6 text-slate-400">如果长时间没收到邮件，先检查垃圾箱；仍然失败时，再联系管理员手动重置账号密码。</p>
          </div>

          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={() => switchMode('password')}
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/8 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/16"
            >
              返回密码登录
            </button>
            <Link href="/register" className="text-center text-sm font-semibold text-slate-400 transition hover:text-cyan-200">
              还没有账号？去注册
            </Link>
          </div>
        </>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-600">
        <Link className="transition hover:text-slate-300" href="/">
          返回首页
        </Link>
        <Link className="transition hover:text-slate-300" href="/register">
          创建账号
        </Link>
        <Link className="transition hover:text-slate-300" href="/forgot-password">
          找回密码
        </Link>
      </div>
    </AuthShell>
  );
}
