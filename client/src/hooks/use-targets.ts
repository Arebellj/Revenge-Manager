import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type Target, type Log, type InsertTarget, type InsertLog } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// ============================================
// TARGET HOOKS
// ============================================

export function useTargets() {
  return useQuery({
    queryKey: [api.targets.list.path],
    queryFn: async () => {
      const res = await fetch(api.targets.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch targets");
      return api.targets.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTarget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertTarget) => {
      const validated = api.targets.create.input.parse(data);
      const res = await fetch(api.targets.create.path, {
        method: api.targets.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.targets.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create target");
      }
      return api.targets.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.targets.list.path] });
      toast({ title: "Revenge Planned", description: "Target added to the list.", className: "bg-red-950 border-red-900 text-red-50" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}

export function useUpdateTarget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertTarget> & { progress?: number, isComplete?: boolean }) => {
      const validated = api.targets.update.input.parse(updates);
      const url = buildUrl(api.targets.update.path, { id });
      
      const res = await fetch(url, {
        method: api.targets.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update target");
      return api.targets.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.targets.list.path] });
      // If marked complete, show specific toast
      if (data.isComplete) {
         toast({ title: "VENGEANCE IS YOURS!", description: "Target eliminated successfully.", className: "bg-red-600 border-red-500 text-white font-bold font-display tracking-widest" });
      }
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}

export function useDeleteTarget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.targets.delete.path, { id });
      const res = await fetch(url, { method: api.targets.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete target");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.targets.list.path] });
      toast({ title: "Removed", description: "Target removed from list.", className: "bg-zinc-900 border-zinc-800 text-zinc-400" });
    },
  });
}

// ============================================
// LOG HOOKS
// ============================================

export function useLogs(targetId: number) {
  return useQuery({
    queryKey: [api.logs.list.path, targetId],
    queryFn: async () => {
      const url = buildUrl(api.logs.list.path, { targetId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.logs.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ targetId, description }: { targetId: number, description: string }) => {
      const validated = api.logs.create.input.parse({ description });
      const url = buildUrl(api.logs.create.path, { targetId });
      
      const res = await fetch(url, {
        method: api.logs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to add log");
      return api.logs.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.logs.list.path, variables.targetId] });
      toast({ title: "Log Entry Added", description: "Your actions have been recorded.", className: "bg-zinc-900 border-zinc-800 text-zinc-200" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}
