'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle,
  Phone,
  Mail,
  MessageSquare,
  Send,
  User,
  SkipForward,
  X,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EscalationWorkflow, EscalationStep, StepStatus, StepAction, StepChannel } from '@/lib/types/alerts';
import { demoWorkflows } from '@/lib/mock/alerts';
import { delays } from '@/lib/mock/delays';
import { toast } from 'sonner';
import { formatDistanceToNow } from '@/lib/utils';

interface EscalationWorkflowProps {
  workflowId?: string;
  alertId?: string;
}

const actionIcons: Record<StepAction, React.ReactNode> = {
  notify: <Send className="h-4 w-4" />,
  call: <Phone className="h-4 w-4" />,
  dispatch: <AlertTriangle className="h-4 w-4" />,
  page: <MessageSquare className="h-4 w-4" />,
  escalate: <AlertTriangle className="h-4 w-4" />,
};

const channelIcons: Record<StepChannel, React.ReactNode> = {
  sms: <MessageSquare className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  push: <Send className="h-4 w-4" />,
  phone: <Phone className="h-4 w-4" />,
  pager: <AlertTriangle className="h-4 w-4" />,
};

const statusConfig: Record<StepStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-slate-100 text-slate-600', icon: <Circle className="h-4 w-4" /> },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-600', icon: <Send className="h-4 w-4" /> },
  delivered: { label: 'Delivered', color: 'bg-yellow-100 text-yellow-600', icon: <CheckCircle2 className="h-4 w-4" /> },
  acknowledged: { label: 'Acknowledged', color: 'bg-green-100 text-green-600', icon: <CheckCircle2 className="h-4 w-4" /> },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-600', icon: <X className="h-4 w-4" /> },
  skipped: { label: 'Skipped', color: 'bg-slate-100 text-slate-400', icon: <SkipForward className="h-4 w-4" /> },
};

function StepCard({ 
  step, 
  isActive,
  isCurrent,
  onComplete,
  onSkip,
  onReassign
}: { 
  step: EscalationStep; 
  isActive: boolean;
  isCurrent: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  onReassign?: () => void;
}) {
  const config = statusConfig[step.status];
  const isOverdue = step.slaDeadline && new Date() > new Date(step.slaDeadline) && step.status !== 'acknowledged';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative p-4 rounded-lg border-2 transition-all ${
        isCurrent 
          ? 'border-blue-500 bg-blue-50' 
          : step.status === 'acknowledged'
          ? 'border-green-200 bg-green-50'
          : 'border-slate-200 bg-white'
      }`}
    >
      {/* Step Number */}
      <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
        {step.order + 1}
      </div>
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={config.color}>
              {config.icon}
              <span className="ml-1">{config.label}</span>
            </Badge>
            {isOverdue && (
              <Badge variant="destructive">
                <Clock className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              {actionIcons[step.action]}
              <span className="capitalize">{step.action}</span>
            </div>
            <div className="flex items-center gap-1">
              {channelIcons[step.channel]}
              <span className="capitalize">{step.channel}</span>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              <span className="font-medium">{step.recipientName}</span>
            </div>
            {step.recipientContact && (
              <p className="text-sm text-slate-500 ml-6">{step.recipientContact}</p>
            )}
          </div>
          
          {step.slaMinutes > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-500">SLA: {step.slaMinutes} min</span>
                {step.slaDeadline && (
                  <span className={isOverdue ? 'text-red-600' : 'text-slate-500'}>
                    Due: {formatDistanceToNow(new Date(step.slaDeadline))}
                  </span>
                )}
              </div>
              {isCurrent && step.slaDeadline && (
                <Progress 
                  value={Math.max(0, Math.min(100, 
                    ((new Date(step.slaDeadline).getTime() - Date.now()) / (step.slaMinutes * 60 * 1000)) * 100
                  ))} 
                  className="h-2"
                />
              )}
            </div>
          )}
          
          {step.messageSent && (
            <div className="mt-3 p-2 bg-slate-50 rounded text-sm">
              <p className="text-slate-600">"{step.messageSent}"</p>
            </div>
          )}
          
          {step.failureReason && (
            <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-600">
              Failed: {step.failureReason}
            </div>
          )}
        </div>
        
        {isCurrent && (
          <div className="flex flex-col gap-2">
            <Button size="sm" onClick={onComplete}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Complete
            </Button>
            <Button size="sm" variant="outline" onClick={onSkip}>
              <SkipForward className="h-4 w-4 mr-1" />
              Skip
            </Button>
            <Button size="sm" variant="ghost" onClick={onReassign}>
              <User className="h-4 w-4 mr-1" />
              Reassign
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function EscalationWorkflowView({ workflowId, alertId }: EscalationWorkflowProps) {
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find workflow by ID or by alertId
  const workflow = workflowId 
    ? demoWorkflows.find(w => w.id === workflowId)
    : demoWorkflows.find(w => w.alertId === alertId);

  if (!workflow) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Circle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600">No Active Workflow</h3>
          <p className="text-slate-500">No escalation workflow is currently running for this alert.</p>
        </CardContent>
      </Card>
    );
  }

  const handleCompleteStep = async (stepOrder: number) => {
    setIsSubmitting(true);
    await delays.fast();
    // In real implementation, this would update the workflow
    toast.success(`Step ${stepOrder + 1} marked as complete`);
    setIsSubmitting(false);
  };

  const handleSkipStep = async (stepOrder: number, reason: string) => {
    setIsSubmitting(true);
    await delays.fast();
    toast.success(`Step ${stepOrder + 1} skipped`);
    setIsSubmitting(false);
  };

  const handleReassign = async (stepOrder: number, newRecipient: string) => {
    setIsSubmitting(true);
    await delays.fast();
    toast.success(`Step ${stepOrder + 1} reassigned to ${newRecipient}`);
    setIsSubmitting(false);
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    setIsSubmitting(true);
    await delays.slow();
    toast.success('Workflow cancelled');
    setShowCancelDialog(false);
    setIsSubmitting(false);
  };

  const handleRestart = async () => {
    setIsSubmitting(true);
    await delays.slow();
    toast.success('Workflow restarted');
    setIsSubmitting(false);
  };

  const progress = ((workflow.currentStep + 1) / workflow.steps.length) * 100;
  const isCompleted = workflow.status === 'completed';
  const isCancelled = workflow.status === 'cancelled';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Escalation Workflow</CardTitle>
              <CardDescription>
                {workflow.templateId === 'template-emergency-dispatch' >
                  ? 'Emergency Dispatch Protocol'
                  : workflow.templateId === 'template-escalate-immediate'
                  ? 'Immediate Escalation'
                  : 'Standard Escalation'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={isCompleted ? 'default' : isCancelled ? 'destructive' : 'secondary'}
              >
                {workflow.status.replace('_', ' ').toUpperCase()}
              </Badge>
              {!isCompleted && !isCancelled && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRestart}
                    disabled={isSubmitting}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Restart
                  </Button>
                  <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancel Workflow</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to cancel this escalation workflow?
                        </DialogDescription>
                      </DialogHeader>
                      <Textarea
                        placeholder="Reason for cancellation..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="mt-4"
                      />
                      <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                          Keep Running
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleCancel}
                          disabled={!cancelReason.trim() || isSubmitting}
                        >
                          Cancel Workflow
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress: Step {workflow.currentStep + 1} of {workflow.steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {workflow.startedAt && (
            <p className="text-sm text-slate-500 mt-4">
              Started: {new Date(workflow.startedAt).toLocaleString()}
            </p>
          )}
          {workflow.completedAt && (
            <p className="text-sm text-slate-500">
              Completed: {new Date(workflow.completedAt).toLocaleString()}
            </p>
          )}
          {workflow.cancelledAt && (
            <p className="text-sm text-red-600">
              Cancelled: {new Date(workflow.cancelledAt).toLocaleString()}
              {workflow.cancellationReason && ` - ${workflow.cancellationReason}`}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-4 pl-6">
        {workflow.steps.map((step, index) => (
          <StepCard
            key={step.order}
            step={step}
            isActive={index <= workflow.currentStep}
            isCurrent={index === workflow.currentStep && !isCompleted && !isCancelled}
            onComplete={() => handleCompleteStep(step.order)}
            onSkip={() => handleSkipStep(step.order, 'Manually skipped')}
            onReassign={() => handleReassign(step.order, 'New Recipient')}
          />
        ))}
      </div>
    </div>
  );
}
