"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Plus, Clock, Copy, Trash2, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccessStore } from "@/lib/store/accessStore";
import { useUnitStore } from "@/lib/store/unitStore";
import { AccessCode } from "@/lib/types";
import { delays } from "@/lib/mock/delays";
import { toast } from "sonner";

function AccessCodeCard({ code, onRevoke }: { code: AccessCode; onRevoke: () => void }) {
  const isExpired = code.expiresAt && code.expiresAt < new Date();
  
  return (
    <Card>
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
            <Key className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold">{code.code}</span>
              <Badge variant={code.type === 'resident' ? 'default' : code.type === 'vendor' ? 'secondary' : 'outline'}>
                {code.type}
              </Badge>
              {isExpired && <Badge variant="destructive">Expired</Badge>}
            </div>
            {code.label && <p className="text-sm text-slate-500">{code.label}</p>}
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>Created {new Date(code.createdAt).toLocaleDateString()}</span>
              {code.expiresAt && (
                <span>Expires {new Date(code.expiresAt).toLocaleString()}</span>
              )}
              {code.usedCount > 0 && (
                <span>Used {code.usedCount} times</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              navigator.clipboard.writeText(code.code);
              toast.success('Code copied to clipboard');
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600"
            onClick={onRevoke}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AccessControl() {
  const accessCodes = useAccessStore((state) => state.accessCodes);
  const generateVendorCode = useAccessStore((state) => state.generateVendorCode);
  const generateTourCode = useAccessStore((state) => state.generateTourCode);
  const revokeCode = useAccessStore((state) => state.revokeCode);
  const units = useUnitStore((state) => state.units);

  const [selectedUnit, setSelectedUnit] = useState('2b');
  const [vendorLabel, setVendorLabel] = useState('');
  const [vendorExpiry, setVendorExpiry] = useState('24');
  const [tourName, setTourName] = useState('');
  const [tourPhone, setTourPhone] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateVendor = async () => {
    if (!vendorLabel) {
      toast.error('Please enter a label');
      return;
    }
    setIsGenerating(true);
    await delays.standard();
    const expiresAt = new Date(Date.now() + parseInt(vendorExpiry) * 60 * 60 * 1000);
    const code = generateVendorCode(selectedUnit, vendorLabel, expiresAt);
    setIsGenerating(false);
    setVendorLabel('');
    toast.success(`Vendor code ${code.code} generated`);
  };

  const handleGenerateTour = async () => {
    if (!tourName) {
      toast.error('Please enter prospect name');
      return;
    }
    setIsGenerating(true);
    await delays.standard();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const code = generateTourCode(selectedUnit, tourName, expiresAt);
    setIsGenerating(false);
    setTourName('');
    setTourPhone('');
    toast.success(`Tour code ${code.code} generated for ${tourName}`);
  };

  const unitCodes = accessCodes.filter(c => c.unitId === selectedUnit);
  const residentCode = unitCodes.find(c => c.type === 'resident');
  const vendorCodes = unitCodes.filter(c => c.type === 'vendor' && (!c.expiresAt || c.expiresAt > new Date()));
  const tourCodes = unitCodes.filter(c => c.type === 'tour' && (!c.expiresAt || c.expiresAt > new Date()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Access Control</h1>
        <p className="text-slate-500">Manage access codes for residents, vendors, and tours</p>
      </div>

      <Tabs defaultValue="vendor" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vendor">Vendor Codes</TabsTrigger>
          <TabsTrigger value="tour">Self-Guided Tours</TabsTrigger>
          <TabsTrigger value="resident">Resident Access</TabsTrigger>
        </TabsList>

        <TabsContent value="vendor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Vendor Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.slice(0, 10).map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          Unit {u.unitNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input
                    placeholder="e.g., Maintenance, Cleaning"
                    value={vendorLabel}
                    onChange={(e) => setVendorLabel(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expires In</Label>
                  <Select value={vendorExpiry} onValueChange={setVendorExpiry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">48 hours</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleGenerateVendor}
                disabled={isGenerating}
                className="w-full md:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Generate Code
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h3 className="font-medium">Active Vendor Codes</h3>
            {vendorCodes.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-slate-500">
                  No active vendor codes
                </CardContent>
              </Card>
            ) : (
              vendorCodes.map((code) => (
                <AccessCodeCard
                  key={code.id}
                  code={code}
                  onRevoke={() => {
                    revokeCode(code.id);
                    toast.success('Code revoked');
                  }}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="tour" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Self-Guided Tour</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.filter(u => u.status === 'vacant').slice(0, 5).map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          Unit {u.unitNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prospect Name</Label>
                  <Input
                    placeholder="Enter prospect name"
                    value={tourName}
                    onChange={(e) => setTourName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone (optional)</Label>
                  <Input
                    placeholder="(555) 123-4567"
                    value={tourPhone}
                    onChange={(e) => setTourPhone(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={handleGenerateTour}
                disabled={isGenerating}
                className="w-full md:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Tour Code
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h3 className="font-medium">Active Tour Codes</h3>
            {tourCodes.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-slate-500">
                  No active tour codes
                </CardContent>
              </Card>
            ) : (
              tourCodes.map((code) => (
                <AccessCodeCard
                  key={code.id}
                  code={code}
                  onRevoke={() => {
                    revokeCode(code.id);
                    toast.success('Code revoked');
                  }}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="resident" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resident Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {residentCode ? (
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                      <Lock className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-mono text-2xl font-bold">****{residentCode.code.slice(-4)}</p>
                      <p className="text-sm text-slate-500">Resident PIN</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>Created {new Date(residentCode.createdAt).toLocaleDateString()}</p>
                    <p>Used {residentCode.usedCount} times</p>
                    {residentCode.lastUsedAt && (
                      <p>Last used {new Date(residentCode.lastUsedAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">No resident access code configured</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
