import { useState } from "react";
import { useLogs, useCreateLog } from "@/hooks/use-targets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Send, FileText, Loader2 } from "lucide-react";

interface LogsListProps {
  targetId: number;
}

export function LogsList({ targetId }: LogsListProps) {
  const { data: logs, isLoading } = useLogs(targetId);
  const createLog = useCreateLog();
  const [newLog, setNewLog] = useState("");

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.trim()) return;
    
    createLog.mutate(
      { targetId, description: newLog },
      { onSuccess: () => setNewLog("") }
    );
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/50 rounded-lg border border-zinc-800/50 overflow-hidden">
      <div className="p-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center gap-2">
        <FileText className="w-4 h-4 text-zinc-500" />
        <h4 className="text-xs font-display uppercase tracking-wider text-zinc-400">Activity Log</h4>
      </div>
      
      <ScrollArea className="flex-1 h-[150px] p-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
          </div>
        ) : !logs?.length ? (
          <div className="text-center py-8 text-zinc-600 text-sm italic">
            No vengeance activities recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="text-sm border-l-2 border-zinc-800 pl-3 py-1 group hover:border-primary transition-colors">
                <p className="text-zinc-300 font-medium leading-relaxed">{log.description}</p>
                <p className="text-[10px] text-zinc-600 mt-1 uppercase font-display tracking-wide">
                  {formatDistanceToNow(new Date(log.createdAt!), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleAddLog} className="p-2 border-t border-zinc-800 flex gap-2">
        <Input 
          value={newLog}
          onChange={(e) => setNewLog(e.target.value)}
          placeholder="Log an action..."
          className="h-9 bg-zinc-900 border-zinc-800 text-sm focus-visible:ring-1 focus-visible:ring-primary/50"
        />
        <Button 
          type="submit" 
          size="icon" 
          className="h-9 w-9 bg-zinc-800 hover:bg-zinc-700 text-white"
          disabled={createLog.isPending || !newLog.trim()}
        >
          {createLog.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
}
