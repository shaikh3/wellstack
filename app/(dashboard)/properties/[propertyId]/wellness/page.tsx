import { PropertyWellnessDashboard } from "@/components/property/PropertyWellnessDashboard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
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

export default async function PropertyWellnessPage({ params }: Props) {
  const { propertyId } = await params;
  const property = getPropertyById(propertyId);

  if (!property) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PropertyWellnessDashboard propertyId={propertyId} />
    </div>
  );
}
