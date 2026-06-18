import StatsDashboard from "../../stats-dashboard";

type PropertyStatsPageProps = {
  params: Promise<{
    propertySlug: string;
  }>;
};

export default async function PropertyStatsPage({
  params,
}: PropertyStatsPageProps) {
  const { propertySlug } = await params;

  return <StatsDashboard propertySlug={propertySlug} />;
}
