import { getAnalytics, AnalyticsData } from "@/lib/api";
import AnalyticsContent from "@/components/analytics/AnalyticsContent";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  let analytics: AnalyticsData | null = null;
  let error: string | null = null;

  try {
    analytics = await getAnalytics(tenant);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load analytics";
  }

  return <AnalyticsContent analytics={analytics} error={error} />;
}
