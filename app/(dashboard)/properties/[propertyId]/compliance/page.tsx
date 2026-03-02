import { WELLComplianceDashboard } from "@/components/compliance/WELLComplianceDashboard";
import { getPropertyById, demoProperties } from "@/lib/mock/data";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    propertyId: string;
  }>;
}

export function generateStaticParams() {
  return demoProperties.map((property) => ({
    propertyId: property.id,
  }));
}

export default async function PropertyCompliancePage({ params }: Props) {
  const { propertyId } = await params;
  const property = getPropertyById(propertyId);

  if (!property) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <WELLComplianceDashboard propertyId={propertyId} />
    </div>
  );
}
