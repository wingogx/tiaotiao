'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, Lock, Mail, User, X } from 'lucide-react';

import { registerUser } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function RegisterForm({ error, success }: { error?: string; success?: string }) {
  const [agreed, setAgreed] = React.useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06110d] px-4 py-8 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(58,190,158,0.24),transparent_34%),linear-gradient(180deg,#06110d_0%,#10231d_50%,#1c3027_100%)]" />
      <main className="relative mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[520px] items-center">
        <Card className="w-full rounded-[34px] border-white/10 bg-[#14241d]/88 p-7 text-white shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl md:p-9">
          <Link href="/" className="ml-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-white/60 transition hover:bg-white/14 hover:text-white" aria-label="回到首页">
            <X size={18} />
          </Link>
          <div className="mt-2 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-emerald-300/35 bg-emerald-400/10 text-3xl">10</div>
            <p className="mt-7 text-[12px] font-semibold uppercase tracking-[0.35em] text-emerald-300/75">Create Account</p>
            <h1 className="serif-heading mt-3 text-3xl font-bold tracking-[0.04em] text-emerald-100">注册会员账号</h1>
            <p className="mt-3 text-sm leading-7 text-slate-300/78">注册后默认没有正文权限，需要管理员在后台开通。</p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-1 rounded-[1.1rem] border border-white/10 bg-black/24 p-1">
            <Link className="flex h-11 items-center justify-center gap-2 rounded-[0.9rem] text-sm font-semibold text-slate-400 transition hover:text-emerald-100" href="/login">
              <Lock size={16} />
              登录
            </Link>
            <div className="flex h-11 items-center justify-center gap-2 rounded-[0.9rem] bg-emerald-300/16 text-sm font-semibold text-emerald-200">
              <Mail size={16} />
              注册
            </div>
          </div>

          {error ? <div className="mt-5 rounded-2xl border border-red-400/25 bg-red-950/35 px-4 py-3 text-sm text-red-100">{error}</div> : null}
          {success ? <div className="mt-5 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{success}</div> : null}

          <form action={registerUser} className="mt-7 space-y-5">
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200" htmlFor="display-name"><User size={16} className="text-emerald-300" />昵称</label>
              <Input id="display-name" name="displayName" placeholder="怎么称呼你" required className="border-white/10 bg-black/24 text-white placeholder:text-slate-500" />
            </div>
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200" htmlFor="register-email"><Mail size={16} className="text-emerald-300" />邮箱</label>
              <Input id="register-email" name="email" type="email" placeholder="用于登录的邮箱" required className="border-white/10 bg-black/24 text-white placeholder:text-slate-500" />
            </div>
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200" htmlFor="register-password"><Lock size={16} className="text-emerald-300" />密码</label>
              <Input id="register-password" name="password" type="password" placeholder="至少 8 位" required className="border-white/10 bg-black/24 text-white placeholder:text-slate-500" />
            </div>
            <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
              <input type="checkbox" name="agreed" value="true" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-1" />
              <span>我理解账号注册后需要管理员开通权限，未授权前只能查看公开内容。</span>
            </label>
            <Button fullWidth disabled={!agreed} className="h-12 rounded-2xl bg-[linear-gradient(135deg,#34d399_0%,#0f766e_100%)] text-base font-bold text-white hover:brightness-110">
              创建账号
            </Button>
          </form>

          {success ? (
            <Link href="/login" className="mt-5 flex items-center justify-center gap-2 text-sm text-emerald-200">
              <Check size={16} />
              前往登录
            </Link>
          ) : null}
        </Card>
      </main>
    </div>
  );
}
