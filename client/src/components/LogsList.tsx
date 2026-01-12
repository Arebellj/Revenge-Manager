import { useState } from "react";
import { useLogs, useCreateLog, useUpdateTarget } from "@/hooks/use-targets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Send, FileText, Loader2, Gauge, Plus } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LogsListProps {
  targetId: number;
  currentProgress?: number;
}

export function LogsList({ targetId, currentProgress = 0 }: LogsListProps) {
  const { data: logs, isLoading } = useLogs(targetId);
  const createLog = useCreateLog();
  const updateTarget = useUpdateTarget();
  const [newLog, setNewLog] = useState("");
  const [tempProgress, setTempProgress] = useState(currentProgress);
  const [isOpen, setIsOpen] = useState(false);

  // Sync tempProgress when currentProgress changes or dialog opens
  const onDialogOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setTempProgress(currentProgress);
    }
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.trim()) return;
    
    createLog.mutate(
      { targetId, description: newLog },
      { 
        onSuccess: () => {
          setNewLog("");
          if (tempProgress !== currentProgress) {
            updateTarget.mutate({
              id: targetId,
              progress: tempProgress,
              isComplete: tempProgress === 100
            });
          }
          setIsOpen(false);
        }
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/50 rounded-lg border border-zinc-800/50 overflow-hidden">
      <div className="p-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-zinc-500" />
          <h4 className="text-xs font-display uppercase tracking-wider text-zinc-400">Activity Log</h4>
        </div>
        
        <Dialog open={isOpen} onOpenChange={onDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 px-2 text-[10px] font-bold uppercase tracking-widest border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <Plus className="w-3 h-3 mr-1" />
              Log Action
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 sm:max-w-[425px]">
            <form onSubmit={handleAddLog}>
              <DialogHeader>
                <DialogTitle className="text-white font-display uppercase tracking-wider">Record Vengeance</DialogTitle>
                <DialogDescription className="text-zinc-500">
                  What have you done to further your cause?
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">The Action</h4>
                  <Textarea 
                    value={newLog}
                    onChange={(e) => setNewLog(e.target.value)}
                    placeholder="Describe your action..."
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-primary/50 min-h-[100px]"
                    required
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Updated Progress</h4>
                    <span className="text-2xl font-display font-bold text-primary tabular-nums">{tempProgress}%</span>
                  </div>
                  <Slider
                    value={[tempProgress]}
                    max={100}
                    step={1}
                    onValueChange={(vals) => setTempProgress(vals[0])}
                    className="cursor-grab active:cursor-grabbing"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white font-display uppercase tracking-widest"
                  disabled={createLog.isPending || !newLog.trim()}
                >
                  {createLog.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    "Record & Update"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <ScrollArea className="flex-1 h-[200px] p-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
          </div>
        ) : !logs?.length ? (
          <div className="text-center py-12 text-zinc-600 text-sm italic">
            No vengeance activities recorded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="text-sm border-l-2 border-zinc-800 pl-4 py-1 group hover:border-primary transition-colors">
                <p className="text-zinc-300 font-medium leading-relaxed">{log.description}</p>
                <p className="text-[10px] text-zinc-600 mt-2 uppercase font-display tracking-wide flex items-center gap-2">
                  <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                  {formatDistanceToNow(new Date(log.createdAt!), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
