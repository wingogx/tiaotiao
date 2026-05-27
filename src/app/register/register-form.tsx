'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, Lock, Mail, User } from 'lucide-react';

import { registerUser } from '@/app/actions';
import { MobileAppShell } from '@/components/mobile/mobile-app-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function RegisterForm({ error, success }: { error?: string; success?: string }) {
  const [agreed, setAgreed] = React.useState(false);

  return (
    <MobileAppShell accountLabel="我">
      <div className="mx-auto max-w-[560px] space-y-5">
        <section className="legacy-gradient relative overflow-hidden rounded-[34px] px-6 py-8 text-white shadow-[0_24px_70px_rgba(201,101,113,0.2)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.26),transparent_30%)]" />
          <div className="relative">
            <div className="inline-flex rounded-full border border-white/18 bg-white/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/78">Create Player</div>
            <h1 className="mt-5 text-4xl font-black leading-tight">创建挑战身份</h1>
            <p className="mt-3 text-sm leading-7 text-white/76">注册后先进入待开通状态；权限开启后可查看完整复盘记忆。</p>
          </div>
        </section>

        <Card className="rounded-[32px] border-[var(--neko-line)] bg-white/78 p-5 shadow-[0_14px_38px_rgba(93,65,57,0.08)] backdrop-blur-xl">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#f7dfe4] text-2xl font-black text-[var(--neko-red)]">10</div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-[var(--neko-muted)]">Player Account</p>
            <h2 className="mt-3 text-3xl font-black text-[var(--neko-ink)]">注册账号</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--neko-muted)]">账号注册不等于付费，完整正文权限由管理员开通。</p>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-1 rounded-[22px] border border-[var(--neko-line)] bg-[#f4ece7] p-1">
            <Link className="flex h-11 items-center justify-center gap-2 rounded-[18px] text-sm font-black text-[var(--neko-brown)] transition hover:bg-white/70" href="/login">
              <Lock size={16} />
              登录
            </Link>
            <div className="flex h-11 items-center justify-center gap-2 rounded-[18px] bg-[var(--neko-red)] text-sm font-black text-white">
              <Mail size={16} />
              注册
            </div>
          </div>

          {error ? <div className="mt-5 rounded-[22px] border border-[#d9a38d] bg-[#fff1ea] px-4 py-3 text-sm text-[#8c3e21]">{error}</div> : null}
          {success ? <div className="mt-5 rounded-[22px] border border-[#9fcbb7] bg-[#eef8f2] px-4 py-3 text-sm text-[#255f47]">{success}</div> : null}

          <form action={registerUser} className="mt-7 space-y-5">
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--neko-brown)]" htmlFor="display-name"><User size={16} className="text-[var(--neko-red)]" />昵称</label>
              <Input id="display-name" name="displayName" placeholder="怎么称呼你" required />
            </div>
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--neko-brown)]" htmlFor="register-email"><Mail size={16} className="text-[var(--neko-red)]" />邮箱</label>
              <Input id="register-email" name="email" type="email" placeholder="用于登录的邮箱" required />
            </div>
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--neko-brown)]" htmlFor="register-password"><Lock size={16} className="text-[var(--neko-red)]" />密码</label>
              <Input id="register-password" name="password" type="password" placeholder="至少 8 位" required />
            </div>
            <label className="flex items-start gap-3 rounded-[22px] border border-[var(--neko-line)] bg-white/62 px-4 py-3 text-sm text-[var(--neko-muted)]">
              <input type="checkbox" name="agreed" value="true" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-1" />
              <span>我理解账号注册后需要管理员开通权限，未授权前只能查看公开内容。</span>
            </label>
            <Button fullWidth disabled={!agreed} className="h-12 rounded-[20px] text-base font-black">
              创建账号
            </Button>
          </form>

          {success ? (
            <Link href="/login" className="mt-5 flex items-center justify-center gap-2 text-sm text-[#255f47]">
              <Check size={16} />
              前往登录
            </Link>
          ) : null}
        </Card>
      </div>
    </MobileAppShell>
  );
}
