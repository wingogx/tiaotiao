import Link from 'next/link';

import { RiskNotice } from '@/components/common/risk-notice';
import { MobileAppShell } from '@/components/mobile/mobile-app-shell';

export default function RiskPage() {
  return (
    <MobileAppShell accountLabel="我">
      <article className="rounded-[32px] border border-[var(--neko-line)] bg-white/78 p-6 text-sm leading-8 text-[var(--neko-brown)] shadow-[0_14px_34px_rgba(93,65,57,0.08)]">
        <Link href="/" className="text-xs font-black text-[var(--neko-red)]">返回首页</Link>
        <h1 className="mt-4 text-3xl font-black text-[var(--neko-ink)]">风险提示</h1>
        <div className="mt-5 space-y-4">
          <RiskNotice />
          <p>本项目展示的是个人收入记录和事后复盘，包含内容收入、产品收入、证券投资等收入类型。证券投资仅作为收入来源记录，不单独提供证券模块。</p>
          <p>任何页面、文章、留言或分享卡均不构成投资建议，不建议跟投，也不承诺任何收益。</p>
        </div>
      </article>
    </MobileAppShell>
  );
}
