"use client";

import { usePortfolioStore } from "@/lib/store/portfolioStore";
import { CommunityDashboard } from "@/components/community/CommunityDashboard";

export default function CommunityPage() {
  const properties = usePortfolioStore((state) => state.properties);
  const defaultProperty = properties[0];

  if (!defaultProperty) return null;

  return <CommunityDashboard propertyId={defaultProperty.id} />;
}
