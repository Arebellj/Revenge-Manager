import { useState, useEffect } from "react";
import { type Target } from "@shared/schema";
import { useUpdateTarget, useDeleteTarget } from "@/hooks/use-targets";
import { LogsList } from "./LogsList";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface TargetCardProps {
  target: Target;
}

export function TargetCard({ target }: TargetCardProps) {
  const updateTarget = useUpdateTarget();
  const deleteTarget = useDeleteTarget();
  
  // Local state for smooth slider experience
  const [progress, setProgress] = useState(target.progress);

  // Sync local state when prop changes (e.g. from refresh)
  useEffect(() => {
    setProgress(target.progress);
  }, [target.progress]);

  const handleProgressChange = (vals: number[]) => {
    const newVal = vals[0];
    setProgress(newVal);
  };

  const handleProgressCommit = (vals: number[]) => {
    const newVal = vals[0];
    const isComplete = newVal === 100;
    
    updateTarget.mutate({ 
      id: target.id, 
      progress: newVal,
      isComplete: isComplete 
    });
  };

  const handleDelete = () => {
    deleteTarget.mutate(target.id);
  };

  const isPurpleEgg = ["isaam", "yagya", "tez"].includes(target.name.toLowerCase());
  const isArebellj = target.name.toLowerCase() === "arebellj";
  const isEasterEgg = isPurpleEgg || isArebellj;

  return (
    <Card className={cn(
      "relative bg-zinc-900 border-zinc-800 overflow-hidden transition-all duration-300 hover:border-zinc-700 group",
      target.isComplete && "border-green-900/30 bg-green-950/5"
    )}>
      {/* Easter Egg Overlay */}
      {isEasterEgg && (
        <div className="absolute inset-0 bg-purple-900/10 border-2 border-purple-500/50 rounded-lg pointer-events-none z-0" />
      )}
      {/* Progress Background Fill */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-900/0 via-red-900/20 to-red-600/20 transition-all duration-500",
          target.isComplete && "from-green-900/0 via-green-900/20 to-green-600/20"
        )}
        style={{ height: `${Math.max(2, progress)}%`, opacity: 0.1, zIndex: 0 }}
      />

      <CardHeader className="relative z-10 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {target.isComplete ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-900/30 text-green-500 uppercase tracking-wider border border-green-900/50">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/30 text-red-500 uppercase tracking-wider border border-red-900/50">
                  <AlertCircle className="w-3 h-3 mr-1" /> In Progress
                </span>
              )}
            </div>
            <CardTitle className={cn(
              "text-2xl text-white font-display tracking-wide flex items-center gap-3",
              isEasterEgg && "text-purple-400 animate-glow-purple"
            )}>
              {target.name}
              {isPurpleEgg && (
                <span className="text-xs font-bold bg-purple-900/40 text-purple-400 px-2 py-0.5 rounded border border-purple-500/50 animate-pulse">
                  [TOP PRIORITY]
                </span>
              )}
              {isArebellj && (
                <span className="text-xs font-bold bg-purple-900/40 text-purple-400 px-2 py-0.5 rounded border border-purple-500/50 animate-pulse">
                  [YOU'RE COOKED]
                </span>
              )}
            </CardTitle>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-red-500 hover:bg-red-950/30 transition-colors" title="Abandon Vengeance">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white font-display">Abandon Vengeance?</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  Are you sure you want to remove {target.name} from your list? They will get away with it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white border-0">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">The Crime</h4>
            <p className="text-sm text-zinc-300 bg-black/20 p-2 rounded border border-white/5 min-h-[60px]">
              {target.reason}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">The Punishment</h4>
            <p className="text-sm text-zinc-300 bg-black/20 p-2 rounded border border-white/5 min-h-[60px]">
              {target.plan}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Revenge Progress</h4>
            <span className={cn(
              "text-2xl font-display font-bold tabular-nums",
              target.isComplete ? "text-green-500" : "text-primary"
            )}>
              {target.progress}%
            </span>
          </div>
          <div className="h-4 bg-zinc-800 rounded-full overflow-hidden shadow-inner border border-zinc-700/50">
            <motion.div 
              className={cn(
                "h-full shadow-[0_0_20px_rgba(220,38,38,0.5)]",
                target.isComplete ? "bg-gradient-to-r from-green-900 via-green-600 to-green-500" : "bg-gradient-to-r from-red-900 via-red-600 to-red-500"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${target.progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>

        <LogsList targetId={target.id} currentProgress={target.progress} />
      </CardContent>
    </Card>
  );
}
