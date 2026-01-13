import { useTargets } from "@/hooks/use-targets";
import { TargetCard } from "@/components/TargetCard";
import { CreateTargetDialog } from "@/components/CreateTargetDialog";
import { Progress } from "@/components/ui/progress";
import { Skull, Crosshair, Users, Trophy, Trash2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Dashboard() {
  const { data: targets, isLoading, error } = useTargets();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAll = async () => {
    try {
      setIsDeleting(true);
      await apiRequest("DELETE", "/api/targets");
      queryClient.invalidateQueries({ queryKey: ["/api/targets"] });
      toast({
        title: "Tabula Rasa",
        description: "All records of your vengeance have been erased.",
      });
    } catch (error: any) {
      toast({
        title: "Operation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-xl font-display text-zinc-500 animate-pulse">Loading Targets...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-red-950/30 border border-red-900 p-8 rounded-xl text-center max-w-md">
          <Skull className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-display text-white mb-2">System Failure</h2>
          <p className="text-red-200">{error.message}</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalTargets = targets?.length || 0;
  const completedTargets = targets?.filter(t => t.isComplete).length || 0;
  const pendingTargets = totalTargets - completedTargets;
  
  const totalProgress = totalTargets > 0 
    ? targets!.reduce((acc, t) => acc + t.progress, 0) / totalTargets 
    : 0;

  const sortedTargets = targets ? [...targets].sort((a, b) => {
    const isAEaster = ["isaam", "yagya", "tez", "arebellj"].includes(a.name.toLowerCase());
    const isBEaster = ["isaam", "yagya", "tez", "arebellj"].includes(b.name.toLowerCase());
    if (isAEaster && !isBEaster) return -1;
    if (!isAEaster && isBEaster) return 1;
    return 0;
  }) : [];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Section */}
      <div className="relative bg-zinc-900/50 border-b border-zinc-800 pt-16 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
        
        <div className="container max-w-5xl mx-auto px-4 relative z-10">
          <header className="mb-12 text-center">
            <h1 className="text-5xl md:text-7xl font-display text-white mb-2 tracking-tight uppercase">
              Revenge<span className="text-primary">Manager</span>
            </h1>
            <p className="text-zinc-500 font-body text-lg tracking-widest uppercase">Serve It Cold</p>
          </header>

          <div className="max-w-3xl mx-auto mb-12">
            <div className="flex justify-between items-end mb-3 px-1">
              <span className="text-zinc-400 font-display uppercase tracking-wider text-sm">Total Vengeance Progress</span>
              <span className="text-3xl font-display font-bold text-primary tabular-nums">{Math.round(totalProgress)}%</span>
            </div>
            <div className="h-4 bg-zinc-800 rounded-full overflow-hidden shadow-inner border border-zinc-700/50">
              <motion.div 
                className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-500 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${totalProgress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-xl flex items-center gap-4 hover:border-zinc-700 transition-colors">
              <div className="p-3 bg-zinc-800 rounded-lg text-zinc-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-white">{totalTargets}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Total Targets</div>
              </div>
            </div>
            
            <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-xl flex items-center gap-4 hover:border-zinc-700 transition-colors">
              <div className="p-3 bg-red-950/50 rounded-lg text-primary">
                <Crosshair className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-white">{pendingTargets}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Pending</div>
              </div>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-xl flex items-center gap-4 hover:border-zinc-700 transition-colors">
              <div className="p-3 bg-green-950/50 rounded-lg text-green-500">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-white">{completedTargets}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto px-4 py-12">
        {!targets || targets.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
            <Skull className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-2xl font-display text-zinc-500 mb-2">No Enemies Listed</h3>
            <p className="text-zinc-600 max-w-md mx-auto">
              Peace is a lie. There is only passion. Through passion, I gain strength. Add your first target to begin.
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {sortedTargets.map((target) => (
              <motion.div
                key={target.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TargetCard target={target} />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {targets && targets.length > 0 && (
        <div className="container max-w-5xl mx-auto px-4 pb-12 flex justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm" 
                className="opacity-50 hover:opacity-100 transition-opacity flex gap-2 items-center"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
                Purge All Records
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-950 border-zinc-800">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="text-primary w-5 h-5" />
                  Absolute Erasure
                </AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  This will permanently delete ALL revenge targets and their associated logs. This action cannot be undone. Are you certain you wish to proceed with this purge?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAll}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Confirm Purge
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <footer className="container max-w-5xl mx-auto px-4 pb-8 text-center">
        <p className="text-zinc-600 font-body text-sm tracking-widest uppercase">
          Created by <span className="text-primary/70">Arebellj</span>
        </p>
      </footer>

      <CreateTargetDialog />
    </div>
  );
}
