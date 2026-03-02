import { FamilyDashboard } from "@/components/family/FamilyDashboard";

interface Props {
  params: Promise<{
    residentId: string;
  }>;
}

const familyResidentIds = [
  'resident-margaret-chen',
  'resident-harold-finch',
  'resident-dorothy-webb',
  'resident-robert-chen',
];

export function generateStaticParams() {
  return familyResidentIds.map((id) => ({
    residentId: id,
  }));
}

export default async function FamilyDashboardPage({ params }: Props) {
  const { residentId } = await params;

  return <FamilyDashboard residentId={residentId} />;
}
