import { PropertyOverview } from "@/components/property/PropertyOverview";
import { getPropertyById } from "@/lib/mock/data";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    propertyId: string;
  }>;
}

export default async function PropertyPage({ params }: Props) {
  const { propertyId } = await params;
  const property = getPropertyById(propertyId);

  if (!property) {
    notFound();
  }

  return <PropertyOverview propertyId={propertyId} />;
}
