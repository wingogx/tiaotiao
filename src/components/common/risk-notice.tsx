export function RiskNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`rounded-[22px] border border-[#f0c98f] bg-[#fff7e8] text-[#7a5324] ${compact ? 'px-4 py-3 text-xs leading-6' : 'px-5 py-4 text-sm leading-7'}`}>
      个人记录，不构成投资建议；收益有波动，过往不代表未来。证券投资仅作为收入来源类型记录，不提供标的、点位、仓位或跟投建议。
    </div>
  );
}
