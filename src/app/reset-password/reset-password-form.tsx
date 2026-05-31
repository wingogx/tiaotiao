'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, KeyRound, LoaderCircle, ShieldCheck } from 'lucide-react';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type RecoveryStatus = 'checking' | 'ready' | 'success' | 'error';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = React.useState<RecoveryStatus>('checking');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function resolveRecoverySession() {
      const supabase = createSupabaseBrowserClient();
      const code = searchParams.get('code')?.trim();

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        window.history.replaceState(null, '', window.location.pathname);

        if (exchangeError) {
          if (!cancelled) {
            setStatus('error');
            setError(exchangeError.message || '重置链接无效或已过期');
          }
          return;
        }

        if (!cancelled) {
          setStatus('ready');
        }
        return;
      }

      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      if (tokenHash && type === 'recovery') {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });

        window.history.replaceState(null, '', window.location.pathname);

        if (verifyError) {
          if (!cancelled) {
            setStatus('error');
            setError(verifyError.message || '重置链接无效或已过期');
          }
          return;
        }

        if (!cancelled) {
          setStatus('ready');
        }
        return;
      }

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const accessToken = hashParams.get('access_token') || '';
      const refreshToken = hashParams.get('refresh_token') || '';

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        window.history.replaceState(null, '', window.location.pathname);

        if (sessionError) {
          if (!cancelled) {
            setStatus('error');
            setError(sessionError.message || '重置链接无效或已过期');
          }
          return;
        }

        if (!cancelled) {
          setStatus('ready');
        }
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        if (!cancelled) {
          setStatus('error');
          setError('没有检测到可用的重置会话，请重新发起找回密码。');
        }
        return;
      }

      if (!cancelled) {
        setStatus('ready');
      }
    }

    resolveRecoverySession().catch((sessionError) => {
      if (!cancelled) {
        setStatus('error');
        setError(sessionError instanceof Error ? sessionError.message : '重置链接无效或已过期');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('新密码至少需要 8 位');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message || '重置密码失败，请稍后重试');
        return;
      }

      await supabase.auth.signOut().catch(() => null);
      setStatus('success');

      window.setTimeout(() => {
        router.replace('/login?reset=1');
      }, 1600);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '重置密码失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title =
    status === 'checking' ? '校验重置链接' : status === 'success' ? '密码已重置' : status === 'error' ? '重置失败' : '设置新密码';

  const description =
    status === 'checking'
      ? '正在确认这次找回请求是否有效，请稍候。'
      : status === 'success'
        ? '新密码已经生效，系统即将带你返回登录页。'
        : status === 'error'
          ? error || '这个重置链接已经失效，请重新发起找回密码。'
          : '输入一个新的登录密码，保存后即可用新密码重新进入挑战舱。';

  return (
    <AuthShell title={title} description={description} brand="TIAOTIAO">
      <div className="mt-7 rounded-[26px] border border-[var(--neko-line)] bg-white/68 px-5 py-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[var(--neko-line)] bg-white/84 shadow-sm">
          {status === 'checking' ? (
            <LoaderCircle className="h-8 w-8 animate-spin text-[var(--neko-red)]" />
          ) : status === 'success' ? (
            <CheckCircle2 className="h-8 w-8 text-[#42b485]" />
          ) : status === 'error' ? (
            <AlertCircle className="h-8 w-8 text-[var(--danger)]" />
          ) : (
            <KeyRound className="h-8 w-8 text-[var(--neko-red)]" />
          )}
        </div>
        <h2 className="mt-5 text-2xl font-black tracking-[0.04em] text-[var(--neko-ink)]">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--neko-muted)]">{description}</p>
      </div>

      {status === 'ready' ? (
        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--neko-brown)]" htmlFor="new-password">
              <KeyRound className="h-4 w-4 text-[var(--neko-red)]" />
              新密码
            </label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="至少 8 位"
              className="h-12 rounded-[20px]"
            />
          </div>

          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--neko-brown)]" htmlFor="confirm-password">
              <ShieldCheck className="h-4 w-4 text-[var(--neko-red)]" />
              确认新密码
            </label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="再次输入新密码"
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
            {isSubmitting ? '保存中...' : '保存新密码'}
          </Button>
        </form>
      ) : null}

      {status === 'error' ? (
        <div className="mt-6 grid gap-3">
          <Link
            href="/forgot-password"
            className="inline-flex h-12 w-full items-center justify-center rounded-[20px] bg-[var(--accent)] text-base font-black text-white shadow-[0_16px_30px_rgba(201,101,113,0.24)] transition hover:bg-[var(--accent-strong)]"
          >
            重新发起找回
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 w-full items-center justify-center rounded-[20px] border border-[var(--border)] bg-white/70 text-sm font-black text-[var(--foreground)] transition hover:bg-white"
          >
            返回登录
          </Link>
        </div>
      ) : null}

      {status === 'success' ? (
        <div className="mt-6">
          <Link
            href="/login?reset=1"
            className="inline-flex h-12 w-full items-center justify-center rounded-[20px] bg-[var(--accent)] text-base font-black text-white shadow-[0_16px_30px_rgba(201,101,113,0.24)] transition hover:bg-[var(--accent-strong)]"
          >
            返回登录
          </Link>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[var(--neko-muted)]">
        <Link className="transition hover:text-[var(--neko-ink)]" href="/">
          返回首页
        </Link>
        <Link className="transition hover:text-[var(--neko-ink)]" href="/login">
          密码登录
        </Link>
        <Link className="transition hover:text-[var(--neko-ink)]" href="/forgot-password">
          重新找回
        </Link>
      </div>
    </AuthShell>
  );
}
