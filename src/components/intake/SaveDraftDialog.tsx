import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useIntakeFormStore } from '@/stores/intakeFormStore';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface SaveDraftDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SaveDraftDialog({ open, onClose }: SaveDraftDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentStep, formData } = useIntakeFormStore();
  const [draftName, setDraftName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !draftName.trim()) return;

    setSaving(true);
    try {
      // Check if a draft with this name already exists
      const { data: existing } = await supabase
        .from('analysis_drafts')
        .select('id')
        .eq('user_id', user.id)
        .eq('draft_name', draftName.trim())
        .single();

      if (existing) {
        // Update existing draft
        const { error } = await supabase
          .from('analysis_drafts')
          .update({
            current_step: currentStep,
            form_data: formData as any,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new draft
        const { error } = await supabase
          .from('analysis_drafts')
          .insert([{
            user_id: user.id,
            draft_name: draftName.trim(),
            current_step: currentStep,
            form_data: formData as any,
          }]);

        if (error) throw error;
      }

      toast({
        title: 'Draft saved',
        description: `"${draftName}" has been saved successfully.`,
      });
      
      setDraftName('');
      onClose();
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: 'Failed to save draft',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Draft</DialogTitle>
          <DialogDescription>
            Save your current progress to continue later. You're on step {currentStep} of 11.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="draft-name">Draft Name</Label>
            <Input
              id="draft-name"
              placeholder="e.g., Client ABC - Medical Device"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && draftName.trim()) {
                  handleSave();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              If a draft with this name exists, it will be updated.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!draftName.trim() || saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
