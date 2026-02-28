"use client";

import Link from "next/link";
import { Building2, ArrowRight, Home, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePortfolioStore } from "@/lib/store/portfolioStore";

export function PropertiesList() {
  const properties = usePortfolioStore((state) => state.properties);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Properties</h1>
        <p className="text-slate-500">Manage all your properties</p>
      </div>

      <div className="grid gap-4">
        {properties.map((property) => (
          <Link key={property.id} href={`/properties/${property.id}`}>
            <Card className="cursor-pointer transition-all hover:shadow-md">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100">
                  <Building2 className="h-8 w-8 text-slate-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{property.name}</h3>
                  <p className="text-sm text-slate-500">{property.address}</p>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Home className="h-4 w-4" />
                      {property.unitCount} units
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {property.deviceHealth}% online
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
