import { UnitDetail } from "@/components/unit/UnitDetail";
import { getPropertyById, getUnitById } from "@/lib/mock/data";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    propertyId: string;
    unitId: string;
  }>;
}

export default async function UnitPage({ params }: Props) {
  const { propertyId, unitId } = await params;
  const property = getPropertyById(propertyId);
  const unit = getUnitById(unitId);

  if (!property || !unit) {
    notFound();
  }

  return <UnitDetail propertyId={propertyId} unitId={unitId} />;
}
