import { UnitDetail } from "@/components/unit/UnitDetail";
import { getPropertyById, getUnitById, demoProperties } from "@/lib/mock/data";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    propertyId: string;
    unitId: string;
  }>;
}

// Generate static params for all property/unit combinations
export function generateStaticParams() {
  const params: { propertyId: string; unitId: string }[] = [];
  
  demoProperties.forEach((property) => {
    property.buildings.forEach((building) => {
      building.units.forEach((unit) => {
        params.push({
          propertyId: property.id,
          unitId: unit.id,
        });
      });
    });
  });
  
  return params;
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
