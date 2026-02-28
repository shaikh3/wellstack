"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Plus, Home, CheckCircle, ArrowRightLeft, Search, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePortfolioStore } from "@/lib/store/portfolioStore";
import { useUnitStore } from "@/lib/store/unitStore";
import { delays } from "@/lib/mock/delays";
import { toast } from "sonner";

function ResidentCard({ unit }: { unit: { id: string; unitNumber: string; propertyId: string; resident?: { name: string; email: string; phone: string; leaseEnd: Date } } }) {
  return (
    <Link href={`/properties/${unit.propertyId}/units/${unit.id}`}>
      <Card className="cursor-pointer transition-all hover:shadow-md">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200">
            <User className="h-6 w-6 text-slate-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{unit.resident?.name}</p>
            <p className="text-sm text-slate-500">{unit.resident?.email}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">Unit {unit.unitNumber}</p>
            <p className="text-sm text-slate-500">Lease ends {new Date(unit.resident?.leaseEnd || '').toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ResidentsPage() {
  const properties = usePortfolioStore((state) => state.properties);
  const units = useUnitStore((state) => state.units);
  const [search, setSearch] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('all');

  const occupiedUnits = units.filter(u => 
    u.status === 'occupied' && u.resident &&
    (search === '' || u.resident.name.toLowerCase().includes(search.toLowerCase()) || u.unitNumber.toLowerCase().includes(search.toLowerCase())) &&
    (selectedProperty === 'all' || u.propertyId === selectedProperty)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Residents</h1>
          <p className="text-slate-500">Manage resident lifecycle and unit assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Move-Out
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Move-In
          </Button>
        </div>
      </div>

      <Tabs defaultValue="residents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="residents">Current Residents</TabsTrigger>
          <TabsTrigger value="movein">Move-In</TabsTrigger>
          <TabsTrigger value="moveout">Move-Out</TabsTrigger>
        </TabsList>

        <TabsContent value="residents" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search residents or units..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {occupiedUnits.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-slate-500">
                  No residents found
                </CardContent>
              </Card>
            ) : (
              occupiedUnits.map((unit) => (
                <ResidentCard key={unit.id} unit={unit} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="movein">
          <Card>
            <CardHeader>
              <CardTitle>Move-In Wizard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Unit</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a vacant unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.filter(u => u.status === 'vacant').slice(0, 5).map((u) => (
                        <SelectItem key={u.id} value={u.id}>Unit {u.unitNumber}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Resident Name</label>
                  <Input placeholder="Full name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="email@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input placeholder="(555) 123-4567" />
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <h4 className="mb-2 font-medium">Automation Preview</h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Thermostat set to 72°F (Comfort mode)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Resident PIN generated and sent
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Unit status changed to Occupied
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Monitoring activated
                  </li>
                </ul>
              </div>

              <Button className="w-full">Complete Move-In</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moveout">
          <Card>
            <CardHeader>
              <CardTitle>Move-Out Wizard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Resident</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a resident" />
                  </SelectTrigger>
                  <SelectContent>
                    {occupiedUnits.slice(0, 5).map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.resident?.name} — Unit {u.unitNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <h4 className="mb-2 font-medium">Move-Out Automation</h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Revoke all access codes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Thermostat setback to 60°F heat / 82°F cool
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Set unit status to Turn
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Generate inspection checklist
                  </li>
                </ul>
              </div>

              <Button variant="destructive" className="w-full">Process Move-Out</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
