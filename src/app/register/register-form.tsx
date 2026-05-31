'use client';

import * as React from 'react';
import Link from 'next/link';
import { CheckCircle2, HelpCircle, Lock, Mail, ShieldCheck, User } from 'lucide-react';

import { registerUser } from '@/app/actions';
import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type RegisterFormProps = {
  error?: string;
  success?: boolean;
  email?: string;
};

export function RegisterForm({ error, success = false, email }: RegisterFormProps) {
  const [agreed, setAgreed] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [clientError, setClientError] = React.useState('');

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      setClientError('');

      if (!agreed) {
        event.preventDefault();
        setClientError('请先确认注册说明');
        return;
      }

      if (password.length < 8) {
        event.preventDefault();
        setClientError('密码至少 8 位');
        return;
      }

      if (password !== confirmPassword) {
        event.preventDefault();
        setClientError('两次输入的密码不一致');
      }
    },
    [agreed, confirmPassword, password],
  );

  if (success) {
    return (
      <AuthShell title="注册成功" description="账号已经创建完成，返回登录页即可使用邮箱和密码登录。" brand="TIAOTIAO">
        <div className="mt-7 rounded-[26px] border border-[#9fcbb7] bg-[#eef8f2] px-5 py-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#9fcbb7] bg-white/84 shadow-sm">
            <CheckCircle2 className="h-8 w-8 text-[#42b485]" />
          </div>
          <h2 className="mt-5 text-2xl font-black tracking-[0.04em] text-[var(--neko-ink)]">欢迎加入</h2>
          <p className="mt-3 text-sm leading-7 text-[#255f47]">
            {email ? (
              <>
                账号 <span className="font-semibold text-[var(--neko-ink)]">{email}</span> 已创建。
              </>
            ) : (
              '账号已创建。'
            )}{' '}
            管理员开通正文权限后即可查看完整复盘内容。
          </p>
        </div>

        <div className="mt-5 rounded-[22px] border border-[var(--neko-line)] bg-white/68 p-4 text-sm text-[var(--neko-brown)]">
          <div className="flex items-center gap-2 font-bold text-[var(--neko-ink)]">
            <ShieldCheck className="h-4 w-4 text-[#42b485]" />
            账号状态
          </div>
          <p className="mt-2 leading-6 text-[var(--neko-muted)]">注册完成后就可以密码登录。找回密码功能也已开通，后续可自行重置密码。</p>
        </div>

        <div className="mt-6 grid gap-3">
          <Link
            href="/login"
            className="inline-flex h-12 w-full items-center justify-center rounded-[20px] bg-[var(--accent)] text-base font-black text-white shadow-[0_16px_30px_rgba(201,101,113,0.24)] transition hover:bg-[var(--accent-strong)]"
          >
            前往登录
          </Link>
          <Link
            href="/forgot-password"
            className="inline-flex h-12 w-full items-center justify-center rounded-[20px] border border-[var(--border)] bg-white/70 text-sm font-black text-[var(--foreground)] transition hover:bg-white"
          >
            找回密码
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="欢迎加入" description="使用邮箱创建账号，开启今天的挑战记录与复盘旅程。" brand="TIAOTIAO">
      <div className="mt-9 grid grid-cols-3 gap-1 rounded-[22px] border border-[var(--neko-line)] bg-[#f4ece7] p-1">
        <Link
          className="flex h-11 items-center justify-center gap-2 rounded-[18px] text-sm font-black text-[var(--neko-brown)] transition hover:bg-white/70"
          href="/login"
        >
          <Lock className="h-4 w-4" />
          密码登录
        </Link>
        <div className="flex h-11 items-center justify-center gap-2 rounded-[18px] bg-[var(--neko-red)] text-sm font-black text-white shadow-sm">
          <Mail className="h-4 w-4" />
          免费注册
        </div>
        <Link
          className="flex h-11 items-center justify-center gap-2 rounded-[18px] text-sm font-black text-[var(--neko-brown)] transition hover:bg-white/70"
          href="/forgot-password"
        >
          <HelpCircle className="h-4 w-4" />
          找回密码
        </Link>
      </div>

      <form action={registerUser} className="mt-7 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--neko-brown)]" htmlFor="display-name">
            <User className="h-4 w-4 text-[var(--neko-red)]" />
            昵称
          </label>
          <Input
            id="display-name"
            name="displayName"
            placeholder="怎么称呼你"
            required
            className="h-12 rounded-[20px]"
          />
        </div>

        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--neko-brown)]" htmlFor="register-email">
            <Mail className="h-4 w-4 text-[var(--neko-red)]" />
            邮箱
          </label>
          <Input
            id="register-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="h-12 rounded-[20px]"
          />
        </div>

        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--neko-brown)]" htmlFor="register-password">
            <Lock className="h-4 w-4 text-[var(--neko-red)]" />
            密码
          </label>
          <Input
            id="register-password"
            name="password"
            type="password"
            placeholder="至少 8 位"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 rounded-[20px]"
          />
        </div>

        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--neko-brown)]" htmlFor="register-confirm-password">
            <ShieldCheck className="h-4 w-4 text-[var(--neko-red)]" />
            确认密码
          </label>
          <Input
            id="register-confirm-password"
            type="password"
            placeholder="再次输入密码"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="h-12 rounded-[20px]"
          />
        </div>

        {error || clientError ? (
          <div className="rounded-[22px] border border-[#d9a38d] bg-[#fff1ea] px-4 py-3 text-sm leading-6 text-[#8c3e21]">{clientError || error}</div>
        ) : null}

        <label className="flex items-start gap-3 rounded-[22px] border border-[var(--neko-line)] bg-white/62 px-4 py-3 text-sm text-[var(--neko-muted)]">
          <input
            type="checkbox"
            name="agreed"
            value="true"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="mt-1"
          />
          <span>我理解账号注册后需要管理员开通权限，未授权前只能查看公开内容。</span>
        </label>

        <Button
          fullWidth
          disabled={!agreed}
          className="h-14 rounded-[22px] text-base font-black shadow-[0_16px_30px_rgba(201,101,113,0.24)]"
        >
          创建账号
        </Button>
      </form>

      <div className="mt-5 rounded-[22px] border border-[var(--neko-line)] bg-white/68 p-4 text-sm text-[var(--neko-brown)]">
        <div className="flex items-center gap-2 font-bold text-[var(--neko-ink)]">
          <ShieldCheck className="h-4 w-4 text-[var(--neko-red)]" />
          注册说明
        </div>
        <p className="mt-2 leading-6 text-[var(--neko-muted)]">注册完成后，可直接用邮箱密码登录；如果忘记密码，可在登录页进入找回密码流程。</p>
      </div>

      <p className="mt-6 text-center text-sm text-[var(--neko-muted)]">
        已经有账号？
        <Link className="ml-1 font-bold text-[var(--neko-red)] transition hover:opacity-80" href="/login">
          立即登录
        </Link>
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[var(--neko-muted)]">
        <Link className="transition hover:text-[var(--neko-ink)]" href="/">
          返回首页
        </Link>
        <Link className="transition hover:text-[var(--neko-ink)]" href="/login">
          密码登录
        </Link>
        <Link className="transition hover:text-[var(--neko-ink)]" href="/forgot-password">
          找回密码
        </Link>
      </div>
    </AuthShell>
  );
}
