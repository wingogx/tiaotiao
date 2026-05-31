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
        <div className="mt-7 rounded-2xl border border-emerald-400/20 bg-emerald-400/8 px-5 py-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/35 bg-emerald-400/10 shadow-[0_0_32px_rgba(52,211,153,0.25)]">
            <CheckCircle2 className="h-8 w-8 text-emerald-300" />
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-[0.06em] text-cyan-300">欢迎加入</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {email ? (
              <>
                账号 <span className="font-semibold text-cyan-300">{email}</span> 已创建。
              </>
            ) : (
              '账号已创建。'
            )}{' '}
            管理员开通正文权限后即可查看完整复盘内容。
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-[#0f1723]/90 p-4 text-sm text-slate-300">
          <div className="flex items-center gap-2 font-medium text-white">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            账号状态
          </div>
          <p className="mt-2 leading-6 text-slate-400">注册完成后就可以密码登录。找回密码功能也已开通，后续可自行重置密码。</p>
        </div>

        <div className="mt-6 grid gap-3">
          <Link
            href="/login"
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#20c7d9_0%,#1d5dca_100%)] text-base font-bold text-white shadow-[0_16px_38px_rgba(29,93,202,0.34)] transition hover:brightness-110"
          >
            前往登录
          </Link>
          <Link
            href="/forgot-password"
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/8 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/16"
          >
            找回密码
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="欢迎加入" description="使用邮箱创建账号，开启今天的挑战记录与复盘旅程。" brand="TIAOTIAO">
      <div className="mt-9 grid grid-cols-3 gap-1 rounded-[1.1rem] border border-cyan-400/18 bg-[#070b12]/70 p-1">
        <Link
          className="flex h-11 items-center justify-center gap-2 rounded-[0.9rem] text-sm font-semibold text-slate-400 transition hover:text-cyan-200"
          href="/login"
        >
          <Lock className="h-4 w-4" />
          密码登录
        </Link>
        <div className="flex h-11 items-center justify-center gap-2 rounded-[0.9rem] bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(37,99,235,0.28))] text-sm font-semibold text-cyan-300 shadow-[inset_0_0_22px_rgba(34,211,238,0.08)]">
          <Mail className="h-4 w-4" />
          免费注册
        </div>
        <Link
          className="flex h-11 items-center justify-center gap-2 rounded-[0.9rem] text-sm font-semibold text-slate-400 transition hover:text-cyan-200"
          href="/forgot-password"
        >
          <HelpCircle className="h-4 w-4" />
          找回密码
        </Link>
      </div>

      <form action={registerUser} className="mt-7 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200" htmlFor="display-name">
            <User className="h-4 w-4 text-cyan-300" />
            昵称
          </label>
          <Input
            id="display-name"
            name="displayName"
            placeholder="怎么称呼你"
            required
            className="h-12 rounded-xl border-cyan-400/18 bg-[#070b12]/84 px-4 text-[15px] text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-[#070b12] focus-visible:ring-cyan-400/30"
          />
        </div>

        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200" htmlFor="register-email">
            <Mail className="h-4 w-4 text-cyan-300" />
            邮箱
          </label>
          <Input
            id="register-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="h-12 rounded-xl border-cyan-400/18 bg-[#070b12]/84 px-4 text-[15px] text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-[#070b12] focus-visible:ring-cyan-400/30"
          />
        </div>

        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200" htmlFor="register-password">
            <Lock className="h-4 w-4 text-cyan-300" />
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
            className="h-12 rounded-xl border-cyan-400/18 bg-[#070b12]/84 px-4 text-[15px] text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-[#070b12] focus-visible:ring-cyan-400/30"
          />
        </div>

        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200" htmlFor="register-confirm-password">
            <ShieldCheck className="h-4 w-4 text-cyan-300" />
            确认密码
          </label>
          <Input
            id="register-confirm-password"
            type="password"
            placeholder="再次输入密码"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="h-12 rounded-xl border-cyan-400/18 bg-[#070b12]/84 px-4 text-[15px] text-white placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-[#070b12] focus-visible:ring-cyan-400/30"
          />
        </div>

        {error || clientError ? (
          <div className="rounded-xl border border-red-400/30 bg-red-950/36 px-4 py-3 text-sm leading-6 text-red-200">{clientError || error}</div>
        ) : null}

        <label className="flex items-start gap-3 text-sm text-slate-500">
          <input
            type="checkbox"
            name="agreed"
            value="true"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-cyan-400/32 bg-transparent accent-cyan-300"
          />
          <span>我理解账号注册后需要管理员开通权限，未授权前只能查看公开内容。</span>
        </label>

        <Button
          fullWidth
          disabled={!agreed}
          className="h-14 rounded-2xl border-0 bg-[linear-gradient(135deg,#20c7d9_0%,#1d5dca_100%)] text-base font-bold tracking-[0.08em] text-white shadow-[0_16px_38px_rgba(29,93,202,0.34)] transition hover:brightness-110"
        >
          创建账号
        </Button>
      </form>

      <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-[#0f1723]/90 p-4 text-sm text-slate-300">
        <div className="flex items-center gap-2 font-medium text-white">
          <ShieldCheck className="h-4 w-4 text-cyan-300" />
          注册说明
        </div>
        <p className="mt-2 leading-6 text-slate-400">注册完成后，可直接用邮箱密码登录；如果忘记密码，可在登录页进入找回密码流程。</p>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        已经有账号？
        <Link className="ml-1 font-semibold text-cyan-300 transition hover:text-cyan-200" href="/login">
          立即登录
        </Link>
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-600">
        <Link className="transition hover:text-slate-300" href="/">
          返回首页
        </Link>
        <Link className="transition hover:text-slate-300" href="/login">
          密码登录
        </Link>
        <Link className="transition hover:text-slate-300" href="/forgot-password">
          找回密码
        </Link>
      </div>
    </AuthShell>
  );
}
