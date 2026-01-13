import { useState } from "react";
import { useCreateTarget } from "@/hooks/use-targets";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Skull } from "lucide-react";

export function CreateTargetDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [plan, setPlan] = useState("");
  
  const createTarget = useCreateTarget();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTarget.mutate(
      { name, reason, plan },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
          setReason("");
          setPlan("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="icon" 
          className="h-14 w-14 rounded-full bg-primary hover:bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)] fixed bottom-8 right-8 z-50 border-4 border-black transition-all hover:scale-110 active:scale-95"
        >
          <Plus className="h-8 w-8 text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-primary flex items-center gap-2">
            <Skull className="w-6 h-6" />
            New Vengeance Target
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Enter the details of your new target to begin tracking your revenge.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-400 font-display uppercase tracking-wider text-xs">Target Name</Label>
            <Input
              id="name"
              placeholder="Who wronged you?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-900 border-zinc-800 focus:border-primary/50 placeholder:text-zinc-700"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-zinc-400 font-display uppercase tracking-wider text-xs">The Offense (Crime)</Label>
            <Textarea
              id="reason"
              placeholder="What did they do?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-zinc-900 border-zinc-800 focus:border-primary/50 min-h-[80px] placeholder:text-zinc-700 resize-none"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="plan" className="text-zinc-400 font-display uppercase tracking-wider text-xs">The Punishment (Plan)</Label>
            <Textarea
              id="plan"
              placeholder="How will you make them pay?"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="bg-zinc-900 border-zinc-800 focus:border-primary/50 min-h-[80px] placeholder:text-zinc-700 resize-none"
              required
            />
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-red-600 text-white font-display uppercase tracking-widest text-lg h-12"
              disabled={createTarget.isPending}
            >
              {createTarget.isPending ? "Plotting..." : "Add to List"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
