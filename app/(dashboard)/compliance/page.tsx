"use client";

import { usePortfolioStore } from "@/lib/store/portfolioStore";
import { WELLComplianceDashboard } from "@/components/compliance/WELLComplianceDashboard";

export default function CompliancePage() {
  const properties = usePortfolioStore((state) => state.properties);
  const defaultProperty = properties[0];

  if (!defaultProperty) return null;

  return <WELLComplianceDashboard propertyId={defaultProperty.id} />;
}
