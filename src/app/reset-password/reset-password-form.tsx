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
      <div className="mt-7 rounded-2xl border border-cyan-400/15 bg-[#0f1723]/90 px-5 py-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-400/10">
          {status === 'checking' ? (
            <LoaderCircle className="h-8 w-8 animate-spin text-cyan-300" />
          ) : status === 'success' ? (
            <CheckCircle2 className="h-8 w-8 text-emerald-300" />
          ) : status === 'error' ? (
            <AlertCircle className="h-8 w-8 text-red-300" />
          ) : (
            <KeyRound className="h-8 w-8 text-cyan-300" />
          )}
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-[0.06em] text-cyan-300">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
      </div>

      {status === 'ready' ? (
        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200" htmlFor="new-password">
              <KeyRound className="h-4 w-4 text-cyan-300" />
              新密码
            </label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="至少 8 位"
              className="h-12 rounded-xl border-cyan-400/18 bg-[#070b12]/84 px-4 text-[15px] text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-[#070b12] focus-visible:ring-cyan-400/30"
            />
          </div>

          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200" htmlFor="confirm-password">
              <ShieldCheck className="h-4 w-4 text-cyan-300" />
              确认新密码
            </label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="再次输入新密码"
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
            {isSubmitting ? '保存中...' : '保存新密码'}
          </Button>
        </form>
      ) : null}

      {status === 'error' ? (
        <div className="mt-6 grid gap-3">
          <Link
            href="/forgot-password"
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#20c7d9_0%,#1d5dca_100%)] text-base font-bold text-white shadow-[0_16px_38px_rgba(29,93,202,0.34)] transition hover:brightness-110"
          >
            重新发起找回
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/8 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/16"
          >
            返回登录
          </Link>
        </div>
      ) : null}

      {status === 'success' ? (
        <div className="mt-6">
          <Link
            href="/login?reset=1"
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#20c7d9_0%,#1d5dca_100%)] text-base font-bold text-white shadow-[0_16px_38px_rgba(29,93,202,0.34)] transition hover:brightness-110"
          >
            返回登录
          </Link>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-600">
        <Link className="transition hover:text-slate-300" href="/">
          返回首页
        </Link>
        <Link className="transition hover:text-slate-300" href="/login">
          密码登录
        </Link>
        <Link className="transition hover:text-slate-300" href="/forgot-password">
          重新找回
        </Link>
      </div>
    </AuthShell>
  );
}
