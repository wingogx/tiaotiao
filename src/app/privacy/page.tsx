import Link from 'next/link';

import { MobileAppShell } from '@/components/mobile/mobile-app-shell';

export default function PrivacyPage() {
  return (
    <MobileAppShell accountLabel="我">
      <article className="rounded-[32px] border border-[var(--neko-line)] bg-white/78 p-6 text-sm leading-8 text-[var(--neko-brown)] shadow-[0_14px_34px_rgba(93,65,57,0.08)]">
        <Link href="/" className="text-xs font-black text-[var(--neko-red)]">返回首页</Link>
        <h1 className="mt-4 text-3xl font-black text-[var(--neko-ink)]">隐私政策</h1>
        <div className="mt-5 space-y-4">
          <p>我们会处理你注册时提交的邮箱、昵称、登录状态，以及你在文章下主动发布的留言内容。</p>
          <p>首页访问次数和围观互动会用于展示项目热度，不用于识别具体投资偏好或提供个性化投资建议。</p>
          <p>如需修改账号资料、删除留言或处理账号权限问题，可以联系管理员处理。</p>
        </div>
      </article>
    </MobileAppShell>
  );
}
