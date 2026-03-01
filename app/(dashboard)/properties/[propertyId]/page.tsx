import { PropertyOverview } from "@/components/property/PropertyOverview";
import { getPropertyById, demoProperties } from "@/lib/mock/data";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    propertyId: string;
  }>;
}

// Generate static params for all properties
export function generateStaticParams() {
  return demoProperties.map((property) => ({
    propertyId: property.id,
  }));
}

export default async function PropertyPage({ params }: Props) {
  const { propertyId } = await params;
  const property = getPropertyById(propertyId);

  if (!property) {
    notFound();
  }

  return <PropertyOverview propertyId={propertyId} />;
}
