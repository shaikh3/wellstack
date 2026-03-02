'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Settings, 
  Play, 
  Trash2, 
  Edit3, 
  ToggleLeft, 
  ToggleRight,
  AlertTriangle,
  Bell,
  Activity,
  Wrench,
  CheckCircle,
  X,
  Building2,
  ChevronDown,
  ChevronUp,
  Save,
  TestTube
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { AlertRule, AlertSeverity, TriggerSource, TriggerCondition, WorkflowTemplate } from '@/lib/types/alerts';
import { demoAlertRules, demoWorkflowTemplates } from '@/lib/mock/alerts';
import { demoProperties } from '@/lib/mock/data';
import { delays } from '@/lib/mock/delays';
import { toast } from 'sonner';

interface AlertRulesEngineProps {
  onTestRule?: (ruleId: string, testData: any) => Promise<{
    triggered: boolean;
    executionTime: number;
  }>;
}

const severityColors: Record<AlertSeverity, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
};

const typeIcons: Record<string, React.ReactNode> = {
  wellness: <Activity className="h-4 w-4" />,
  safety: <AlertTriangle className="h-4 w-4" />,
  ieq: <Wrench className="h-4 w-4" />,
  device: <Bell className="h-4 w-4" />,
};

const conditionLabels: Record<TriggerCondition, string> = {
  lt: '< (less than)',
  lte: '<= (less than or equal)',
  gt: '> (greater than)',
  gte: '>= (greater than or equal)',
  eq: '= (equal to)',
  changed: 'changed',
  event: 'event triggered',
};

interface RuleFormData {
  name: string;
  description: string;
  triggerSource: TriggerSource;
  condition: TriggerCondition;
  threshold: string;
  duration: string;
  severity: AlertSeverity;
  titleTemplate: string;
  descriptionTemplate: string;
  workflowTemplateId: string;
}

function RuleEditDialog({ 
  rule, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  rule?: AlertRule; 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (data: Partial<AlertRule>) => void;
}) {
  const [formData, setFormData] = useState<RuleFormData>({
    name: rule?.name || '',
    description: rule?.description || '',
    triggerSource: rule?.trigger.source || 'wellness_score',
    condition: rule?.trigger.condition || 'lt',
    threshold: rule?.trigger.threshold?.toString() || '',
    duration: rule?.trigger.duration?.toString() || '0',
    severity: rule?.severity || 'warning',
    titleTemplate: rule?.titleTemplate || '',
    descriptionTemplate: rule?.descriptionTemplate || '',
    workflowTemplateId: rule?.workflowTemplateId || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await delays.fast();
    
    onSave({
      name: formData.name,
      description: formData.description,
      trigger: {
        source: formData.triggerSource,
        condition: formData.condition,
        threshold: formData.threshold ? parseFloat(formData.threshold) : undefined,
        duration: parseInt(formData.duration) || 0,
      },
      severity: formData.severity,
      titleTemplate: formData.titleTemplate,
      descriptionTemplate: formData.descriptionTemplate,
      workflowTemplateId: formData.workflowTemplateId,
    });
    
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rule ? 'Edit Rule' : 'New Alert Rule'}</DialogTitle>
          <DialogDescription>
            Configure when this alert should trigger and how it should be handled.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Rule Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Wellness Score Low"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe when this rule should trigger..."
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Trigger Source</Label>
                <Select 
                  value={formData.triggerSource} 
                  onValueChange={(v) => setFormData({ ...formData, triggerSource: v as TriggerSource })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wellness_score">Wellness Score</SelectItem>
                    <SelectItem value="fall_detected">Fall Detected</SelectItem>
                    <SelectItem value="ieq_violation">IEQ Violation</SelectItem>
                    <SelectItem value="device_offline">Device Offline</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Condition</Label>
                <Select 
                  value={formData.condition} 
                  onValueChange={(v) => setFormData({ ...formData, condition: v as TriggerCondition })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(conditionLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="threshold">Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={formData.threshold}
                  onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                  placeholder="e.g., 70"
                />
              </div>
              
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="0 = immediate"
                />
              </div>
            </div>
            
            <div>
              <Label>Severity</Label>
              <Select 
                value={formData.severity} 
                onValueChange={(v) => setFormData({ ...formData, severity: v as AlertSeverity })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="workflow">Workflow Template</Label>
              <Select 
                value={formData.workflowTemplateId} 
                onValueChange={(v) => setFormData({ ...formData, workflowTemplateId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workflow..." />
                </SelectTrigger>
                <SelectContent>
                  {demoWorkflowTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="border-t pt-4">
              <Label className="text-sm font-medium">Message Templates</Label>
              <p className="text-xs text-slate-500 mb-2">
                Use {'{{unitName}}'}, {'{{residentName}}'}, {'{{actualValue}}'}, {'{{threshold}}'} as placeholders
              </p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="titleTemplate" className="text-sm">Alert Title</Label>
                  <Input
                    id="titleTemplate"
                    value={formData.titleTemplate}
                    onChange={(e) => setFormData({ ...formData, titleTemplate: e.target.value })}
                    placeholder="e.g., {{unitName}}: Wellness Score {{actualValue}}"
                  />
                </div>
                <div>
                  <Label htmlFor="descTemplate" className="text-sm">Alert Description</Label>
                  <Textarea
                    id="descTemplate"
                    value={formData.descriptionTemplate}
                    onChange={(e) => setFormData({ ...formData, descriptionTemplate: e.target.value })}
                    placeholder="e.g., Wellness score for {{residentName}} has dropped to {{actualValue}}."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              Save Rule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PropertyOverrides({ propertyId }: { propertyId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-between">
          <span className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Property Overrides
          </span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 bg-slate-50 rounded-lg mt-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Wellness Score Threshold</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Default: 70</span>
              <Input className="w-20" placeholder="60" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">CO2 Threshold</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Default: 1000</span>
              <Input className="w-20" placeholder="900" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Quiet Hours</span>
            <div className="flex items-center gap-2">
              <Input className="w-20" placeholder="22:00" />
              <span>to</span>
              <Input className="w-20" placeholder="06:00" />
            </div>
          </div>
          <Button size="sm" variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Overrides
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AlertRulesEngine({ onTestRule }: AlertRulesEngineProps) {
  const [rules, setRules] = useState<AlertRule[]>(demoAlertRules);
  const [editingRule, setEditingRule] = useState<AlertRule | undefined>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [testingRuleId, setTestingRuleId] = useState<string | null>(null);

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    await delays.fast();
    setRules(rules.map(r => 
      r.id === ruleId ? { ...r, enabled } : r
    ));
    toast.success(`Rule ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleDeleteRule = async (ruleId: string) => {
    await delays.fast();
    setRules(rules.filter(r => r.id !== ruleId));
    toast.success('Rule deleted');
  };

  const handleSaveRule = async (data: Partial<AlertRule>) => {
    if (editingRule) {
      setRules(rules.map(r => 
        r.id === editingRule.id ? { ...r, ...data, updatedAt: new Date() } : r
      ));
      toast.success('Rule updated');
    } else {
      const newRule: AlertRule = {
        ...data,
        id: `rule-${Date.now()}`,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as AlertRule;
      setRules([...rules, newRule]);
      toast.success('Rule created');
    }
    setIsEditDialogOpen(false);
    setEditingRule(undefined);
    setIsCreating(false);
  };

  const handleTestRule = async (rule: AlertRule) => {
    setTestingRuleId(rule.id);
    await delays.slow();
    
    if (onTestRule) {
      const result = await onTestRule(rule.id, { test: true });
      toast.success(
        `Test completed: ${result.triggered ? 'Triggered' : 'Not triggered'} (${result.executionTime}ms)`
      );
    } else {
      toast.success('Test completed: Rule would trigger');
    }
    
    setTestingRuleId(null);
  };

  const openNewRuleDialog = () => {
    setEditingRule(undefined);
    setIsCreating(true);
    setIsEditDialogOpen(true);
  };

  const openEditDialog = (rule: AlertRule) => {
    setEditingRule(rule);
    setIsCreating(false);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alert Rules</h1>
          <p className="text-slate-500">Configure when alerts trigger and how they escalate</p>
        </div>
        <Button onClick={openNewRuleDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Rule
        </Button>
      </div>

      {/* Rules List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Rules ({rules.filter(r => r.enabled).length})</CardTitle>
          <CardDescription>
            Rules are evaluated in order. First matching rule wins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rules.map((rule, index) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${
                  rule.enabled ? 'bg-white' : 'bg-slate-50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-sm text-slate-400 w-6">{index + 1}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{rule.name}</h3>
                        {!rule.enabled && (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{rule.description}</p>
                      
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {typeIcons[rule.trigger.source] || <Bell className="h-3 w-3" />}
                          {rule.trigger.source.replace('_', ' ')}
                        </Badge>
                        
                        <Badge className={severityColors[rule.severity]}>
                          {rule.severity}
                        </Badge>
                        
                        {rule.trigger.threshold !== undefined && (
                          <Badge variant="outline">
                            {rule.trigger.condition} {rule.trigger.threshold}
                          </Badge>
                        )}
                        
                        {rule.trigger.duration > 0 && (
                          <Badge variant="outline">
                            {rule.trigger.duration}min duration
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTestRule(rule)}
                      disabled={testingRuleId === rule.id}
                    >
                      <TestTube className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(rule)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleRule(rule.id, !rule.enabled)}
                    >
                      {rule.enabled ? (
                        <ToggleRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-slate-400" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Property Overrides */}
      <Card>
        <CardHeader>
          <CardTitle>Property Overrides</CardTitle>
          <CardDescription>
            Customize rules per property
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demoProperties.slice(0, 2).map((property) => (
              <div key={property.id} className="border rounded-lg">
                <div className="p-4 bg-slate-50 border-b">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    <span className="font-medium">{property.name}</span>
                  </div>
                </div>
                <div className="p-4">
                  <PropertyOverrides propertyId={property.id} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <RuleEditDialog
        rule={editingRule}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingRule(undefined);
          setIsCreating(false);
        }}
        onSave={handleSaveRule}
      />
    </div>
  );
}
