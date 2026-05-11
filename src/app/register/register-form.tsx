'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Lock, Mail, User } from 'lucide-react';

import { registerUser } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function RegisterForm({ error, success }: { error?: string; success?: string }) {
  const [agreed, setAgreed] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#f2eee5] text-[#1f2a28]">
      <main className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-[#8f5b34] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,227,160,0.22),transparent_28%),radial-gradient(circle_at_80%_72%,rgba(39,61,54,0.34),transparent_34%)]" />
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#f2d492] font-semibold text-[#2c261e]">10</div>
          <div className="relative max-w-xl">
            <p className="text-xs uppercase tracking-[0.28em] text-[#f2d492]">Join the Journal</p>
            <h1 className="serif-heading mt-5 text-6xl leading-tight">先成为读者，再看完整过程。</h1>
            <p className="mt-6 text-lg leading-9 text-white/74">注册后账号会进入等待授权状态。管理员开通后，你就能查看会员正文内容。</p>
          </div>
          <div className="relative text-sm text-white/70">注册不等于付费，第一版由管理员手动开通权限。</div>
        </section>

        <section className="flex items-center justify-center px-5 py-8">
        <Card className="w-full max-w-[520px] rounded-[28px] border-[#d8d0c0] bg-[#fffdf7] p-6 shadow-[0_24px_70px_rgba(49,45,35,0.12)] md:p-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#66706b] transition hover:text-[#1f2a28]">
            <ArrowLeft size={16} />
            返回首页
          </Link>
          <div className="mt-2 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8f5b34] text-2xl text-[#ffe4a7]">10</div>
            <p className="mt-7 text-[12px] font-semibold uppercase tracking-[0.28em] text-[#9b7142]">Create Account</p>
            <h1 className="serif-heading mt-3 text-4xl font-semibold text-[#1f2a28]">注册会员账号</h1>
            <p className="mt-3 text-sm leading-7 text-[#66706b]">注册后默认没有正文权限，需要管理员在后台开通。</p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-1 rounded-2xl border border-[#ded6c7] bg-[#eee8dc] p-1">
            <Link className="flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-[#66706b] transition hover:text-[#1f2a28]" href="/login">
              <Lock size={16} />
              登录
            </Link>
            <div className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#22322f] text-sm font-semibold text-white">
              <Mail size={16} />
              注册
            </div>
          </div>

          {error ? <div className="mt-5 rounded-2xl border border-[#d9a38d] bg-[#fff1ea] px-4 py-3 text-sm text-[#8c3e21]">{error}</div> : null}
          {success ? <div className="mt-5 rounded-2xl border border-[#9fcbb7] bg-[#eef8f2] px-4 py-3 text-sm text-[#255f47]">{success}</div> : null}

          <form action={registerUser} className="mt-7 space-y-5">
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#34413d]" htmlFor="display-name"><User size={16} className="text-[#9b7142]" />昵称</label>
              <Input id="display-name" name="displayName" placeholder="怎么称呼你" required className="border-[#ded6c7] bg-[#f7f2e8] text-[#1f2a28] placeholder:text-[#8f938d]" />
            </div>
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#34413d]" htmlFor="register-email"><Mail size={16} className="text-[#9b7142]" />邮箱</label>
              <Input id="register-email" name="email" type="email" placeholder="用于登录的邮箱" required className="border-[#ded6c7] bg-[#f7f2e8] text-[#1f2a28] placeholder:text-[#8f938d]" />
            </div>
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#34413d]" htmlFor="register-password"><Lock size={16} className="text-[#9b7142]" />密码</label>
              <Input id="register-password" name="password" type="password" placeholder="至少 8 位" required className="border-[#ded6c7] bg-[#f7f2e8] text-[#1f2a28] placeholder:text-[#8f938d]" />
            </div>
            <label className="flex items-start gap-3 rounded-2xl border border-[#ded6c7] bg-[#f7f2e8] px-4 py-3 text-sm text-[#66706b]">
              <input type="checkbox" name="agreed" value="true" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-1" />
              <span>我理解账号注册后需要管理员开通权限，未授权前只能查看公开内容。</span>
            </label>
            <Button fullWidth disabled={!agreed} className="h-12 rounded-2xl bg-[#22322f] text-base font-bold text-white hover:bg-[#304640]">
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
        </section>
      </main>
    </div>
  );
}
