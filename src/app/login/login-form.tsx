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
      <div className="mt-9 grid grid-cols-3 gap-1 rounded-[22px] border border-[var(--neko-line)] bg-[#f4ece7] p-1">
        <button
          type="button"
          onClick={() => switchMode('password')}
          className={`flex h-11 items-center justify-center gap-2 rounded-[18px] text-sm font-black transition ${
            mode === 'password'
              ? 'bg-[var(--neko-red)] text-white shadow-sm'
              : 'text-[var(--neko-brown)] hover:bg-white/70'
          }`}
        >
          <Lock className="h-4 w-4" />
          密码登录
        </button>
        <Link
          className="flex h-11 items-center justify-center gap-2 rounded-[18px] text-sm font-black text-[var(--neko-brown)] transition hover:bg-white/70"
          href="/register"
        >
          <Mail className="h-4 w-4" />
          免费注册
        </Link>
        <button
          type="button"
          onClick={() => switchMode('forgot')}
          className={`flex h-11 items-center justify-center gap-2 rounded-[18px] text-sm font-black transition ${
            mode === 'forgot'
              ? 'bg-[var(--neko-red)] text-white shadow-sm'
              : 'text-[var(--neko-brown)] hover:bg-white/70'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          找回密码
        </button>
      </div>

      {resetSuccess ? (
        <div className="mt-6 rounded-[22px] border border-[#9fcbb7] bg-[#eef8f2] px-4 py-3 text-sm leading-6 text-[#255f47]">
          密码已重置，请使用新密码登录。
        </div>
      ) : null}

      {mode === 'password' ? (
        <>
          <form className="mt-7 space-y-5" onSubmit={handlePasswordLogin}>
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--neko-brown)]" htmlFor="login-email">
                <Mail className="h-4 w-4 text-[var(--neko-red)]" />
                用户名或邮箱
              </label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-12 rounded-[20px]"
              />
            </div>

            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--neko-brown)]" htmlFor="login-password">
                <ShieldCheck className="h-4 w-4 text-[var(--neko-red)]" />
                密码
              </label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="输入密码"
                className="h-12 rounded-[20px]"
              />
            </div>

            {error ? (
              <div className="rounded-[22px] border border-[#d9a38d] bg-[#fff1ea] px-4 py-3 text-sm leading-6 text-[#8c3e21]">{error}</div>
            ) : null}

            <Button
              fullWidth
              disabled={isSubmitting}
              className="h-14 rounded-[22px] text-base font-black shadow-[0_16px_30px_rgba(201,101,113,0.24)]"
            >
              {isSubmitting ? '登录中...' : '登录'}
            </Button>

            <button
              type="button"
              onClick={() => switchMode('forgot')}
              className="w-full text-center text-sm font-bold text-[var(--neko-red)] transition hover:opacity-80"
            >
              忘记密码？
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--neko-muted)]">
            还没有账号？
            <Link className="ml-1 font-bold text-[var(--neko-red)] transition hover:opacity-80" href="/register">
              免费注册
            </Link>
          </div>
        </>
      ) : forgotSuccess ? (
        <div className="mt-7 space-y-4">
          <div className="rounded-[22px] border border-[#9fcbb7] bg-[#eef8f2] px-4 py-4 text-sm leading-7 text-[#255f47]">
            如果 <span className="font-semibold text-[var(--neko-ink)]">{forgotEmail.trim()}</span> 是已注册邮箱，系统会发送重置密码邮件。请查收收件箱和垃圾箱。
          </div>
          <div className="rounded-[22px] border border-[var(--neko-line)] bg-white/68 p-4 text-sm text-[var(--neko-brown)]">
            <div className="flex items-center gap-2 font-bold text-[var(--neko-ink)]">
              <ShieldCheck className="h-4 w-4 text-[#42b485]" />
              邮件重置流程
            </div>
            <p className="mt-2 leading-6 text-[var(--neko-muted)]">邮件中的链接会带你进入设置新密码页面。设置完成后，返回登录页使用新密码登录即可。</p>
          </div>
          <Button
            fullWidth
            className="h-12 rounded-[20px] text-base font-black shadow-[0_16px_30px_rgba(201,101,113,0.24)]"
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
              <label className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--neko-brown)]" htmlFor="forgot-email">
                <Mail className="h-4 w-4 text-[var(--neko-red)]" />
                注册邮箱
              </label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={forgotEmail}
                onChange={(event) => setForgotEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-12 rounded-[20px]"
              />
            </div>

            {forgotError ? (
              <div className="rounded-[22px] border border-[#d9a38d] bg-[#fff1ea] px-4 py-3 text-sm leading-6 text-[#8c3e21]">{forgotError}</div>
            ) : null}

            <Button
              fullWidth
              disabled={isForgotSubmitting}
              className="h-14 rounded-[22px] text-base font-black shadow-[0_16px_30px_rgba(201,101,113,0.24)]"
            >
              {isForgotSubmitting ? '发送中...' : '发送重置邮件'}
            </Button>
          </form>

          <div className="mt-5 rounded-[22px] border border-[var(--neko-line)] bg-white/68 p-4 text-sm text-[var(--neko-brown)]">
            <div className="flex items-center gap-2 font-bold text-[var(--neko-ink)]">
              <HelpCircle className="h-4 w-4 text-[var(--neko-red)]" />
              使用说明
            </div>
            <p className="mt-2 leading-6 text-[var(--neko-muted)]">如果长时间没收到邮件，先检查垃圾箱；仍然失败时，再联系管理员手动重置账号密码。</p>
          </div>

          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={() => switchMode('password')}
              className="inline-flex h-12 w-full items-center justify-center rounded-[20px] border border-[var(--border)] bg-white/70 text-sm font-black text-[var(--foreground)] transition hover:bg-white"
            >
              返回密码登录
            </button>
            <Link href="/register" className="text-center text-sm font-bold text-[var(--neko-red)] transition hover:opacity-80">
              还没有账号？去注册
            </Link>
          </div>
        </>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[var(--neko-muted)]">
        <Link className="transition hover:text-[var(--neko-ink)]" href="/">
          返回首页
        </Link>
        <Link className="transition hover:text-[var(--neko-ink)]" href="/register">
          创建账号
        </Link>
        <Link className="transition hover:text-[var(--neko-ink)]" href="/forgot-password">
          找回密码
        </Link>
      </div>
    </AuthShell>
  );
}
