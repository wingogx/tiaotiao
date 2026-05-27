import { Hero } from '@/components/home/hero';
import { getDashboardData } from '@/lib/data/queries';

export default async function Home() {
  const data = await getDashboardData();

  return (
    <div className="pb-16">
      <main className="pb-12">
        <Hero data={data} />
      </main>
    </div>
  );
}
