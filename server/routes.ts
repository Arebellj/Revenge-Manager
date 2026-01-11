import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Targets
  app.get(api.targets.list.path, async (req, res) => {
    const targets = await storage.getTargets();
    res.json(targets);
  });

  app.get(api.targets.get.path, async (req, res) => {
    const target = await storage.getTarget(Number(req.params.id));
    if (!target) {
      return res.status(404).json({ message: 'Target not found' });
    }
    res.json(target);
  });

  app.post(api.targets.create.path, async (req, res) => {
    try {
      const input = api.targets.create.input.parse(req.body);
      const target = await storage.createTarget(input);
      res.status(201).json(target);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.targets.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.targets.update.input.parse(req.body);
      
      const existing = await storage.getTarget(id);
      if (!existing) {
        return res.status(404).json({ message: 'Target not found' });
      }

      // Logic: if progress is 100, set isComplete to true (if not provided)
      // if progress < 100, set isComplete to false (if not provided)
      let updates = { ...input };
      if (input.progress !== undefined) {
         if (input.progress === 100 && input.isComplete === undefined) {
           updates.isComplete = true;
         } else if (input.progress < 100 && input.isComplete === undefined) {
           updates.isComplete = false;
         }
      }

      const updated = await storage.updateTarget(id, updates);
      res.json(updated);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.targets.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getTarget(id);
    if (!existing) {
      return res.status(404).json({ message: 'Target not found' });
    }
    await storage.deleteTarget(id);
    res.status(204).send();
  });

  app.delete(api.targets.deleteAll.path, async (req, res) => {
    await storage.deleteAllData();
    res.status(204).send();
  });

  // Logs
  app.get(api.logs.list.path, async (req, res) => {
    const targetId = Number(req.params.targetId);
    // Check target exists? Optional but good practice.
    const target = await storage.getTarget(targetId);
    if (!target) {
       return res.status(404).json({ message: 'Target not found' });
    }
    const logs = await storage.getLogs(targetId);
    res.json(logs);
  });

  app.post(api.logs.create.path, async (req, res) => {
    try {
      const targetId = Number(req.params.targetId);
      const inputBody = api.logs.create.input.parse(req.body);
      const input = { ...inputBody, targetId };
      
      const target = await storage.getTarget(targetId);
      if (!target) {
        return res.status(404).json({ message: 'Target not found' });
      }

      const log = await storage.createLog(input);
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingTargets = await storage.getTargets();
  if (existingTargets.length === 0) {
    const t1 = await storage.createTarget({
      name: "The Neighbors Dog",
      reason: "Barks all night long keeping me awake",
      plan: "Buy an ultra-sonic bark deterrent device",
      progress: 30,
      isComplete: false
    });
    await storage.createLog({ targetId: t1.id, description: "Researched devices on Amazon" });

    const t2 = await storage.createTarget({
      name: "Vending Machine",
      reason: "Stole my dollar and didn't give me a snack",
      plan: "Shake it until it drops the snack or breaks",
      progress: 0,
      isComplete: false
    });

    const t3 = await storage.createTarget({
      name: "My Nemesis",
      reason: "Existing on the same planet as me",
      plan: "Complete global domination to exile them",
      progress: 100,
      isComplete: true
    });
    await storage.createLog({ targetId: t3.id, description: "Acquired secret lair" });
    await storage.createLog({ targetId: t3.id, description: "Launched plan" });
  }
}
