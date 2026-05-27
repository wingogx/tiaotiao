import { ArticlePreview } from '@/components/home/article-preview';
import { Hero } from '@/components/home/hero';
import { RevenueOverview } from '@/components/home/revenue-overview';
import { getDashboardData } from '@/lib/data/queries';

export default async function Home() {
  const data = await getDashboardData();

  return (
    <div className="pb-16">
      <main className="space-y-10 pb-12">
        <Hero data={data} />
        <RevenueOverview data={data} />
        <ArticlePreview data={data} />
      </main>
    </div>
  );
}
