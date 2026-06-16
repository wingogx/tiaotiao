import Link from 'next/link';

import { MobileAppShell } from '@/components/mobile/mobile-app-shell';

export default function TermsPage() {
  return (
    <MobileAppShell accountLabel="我">
      <LegalPage title="用户协议">
        <p>本项目用于记录个人 1000 天真实盈利过程、复盘日记和人生领悟。公开内容可供浏览，完整复盘内容和留言能力需登录并获得相应权限。</p>
        <p>用户不得在评论区发布荐股、带单、拉群、广告、辱骂、人身攻击、引导转账或其他违法违规内容。管理员有权隐藏或删除不合规留言。</p>
        <p>会员权限仅代表可查看完整复盘和参与留言，不代表获得投资咨询、收益承诺、跟投服务或任何个性化建议。</p>
      </LegalPage>
    </MobileAppShell>
  );
}

function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[32px] border border-[var(--neko-line)] bg-white/78 p-6 text-sm leading-8 text-[var(--neko-brown)] shadow-[0_14px_34px_rgba(93,65,57,0.08)]">
      <Link href="/" className="text-xs font-black text-[var(--neko-red)]">返回首页</Link>
      <h1 className="mt-4 text-3xl font-black text-[var(--neko-ink)]">{title}</h1>
      <div className="mt-5 space-y-4">{children}</div>
    </article>
  );
}
