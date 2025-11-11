import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useIntakeFormStore } from '@/stores/intakeFormStore';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Draft {
  id: string;
  draft_name: string;
  current_step: number;
  form_data: any;
  created_at: string;
  updated_at: string;
}

interface DraftManagerProps {
  open: boolean;
  onClose: () => void;
  onLoadDraft: (draft: Draft) => void;
}

export function DraftManager({ open, onClose, onLoadDraft }: DraftManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadDrafts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('analysis_drafts')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDrafts(data || []);
    } catch (error) {
      console.error('Error loading drafts:', error);
      toast({
        title: 'Failed to load drafts',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadDrafts();
    }
  }, [open, user]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('analysis_drafts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDrafts(drafts.filter(d => d.id !== id));
      toast({
        title: 'Draft deleted',
        description: 'The draft has been removed.',
      });
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast({
        title: 'Failed to delete draft',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleLoad = (draft: Draft) => {
    onLoadDraft(draft);
    onClose();
    toast({
      title: 'Draft loaded',
      description: `Continuing from step ${draft.current_step}`,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Load Draft</DialogTitle>
            <DialogDescription>
              Select a draft to continue working on
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : drafts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No saved drafts</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start a new analysis or save your progress as a draft
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft) => (
                <Card key={draft.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{draft.draft_name}</CardTitle>
                        <CardDescription className="mt-1">
                          Step {draft.current_step} of 11 • {draft.form_data.inventionTitle || 'Untitled'}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(draft.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Updated {format(new Date(draft.updated_at), 'PPp')}</span>
                      </div>
                      <Button onClick={() => handleLoad(draft)}>
                        Continue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The draft will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
