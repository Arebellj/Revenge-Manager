import { db } from "./db";
import {
  targets,
  logs,
  type Target,
  type InsertTarget,
  type Log,
  type InsertLog,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getTargets(): Promise<Target[]>;
  getTarget(id: number): Promise<(Target & { logs: Log[] }) | undefined>;
  createTarget(target: InsertTarget): Promise<Target>;
  updateTarget(id: number, updates: Partial<InsertTarget> & { progress?: number; isComplete?: boolean }): Promise<Target | undefined>;
  deleteTarget(id: number): Promise<void>;
  deleteAllData(): Promise<void>;
  
  getLogs(targetId: number): Promise<Log[]>;
  createLog(log: InsertLog): Promise<Log>;
}

export class DatabaseStorage implements IStorage {
  async getTargets(): Promise<Target[]> {
    return await db.select().from(targets).orderBy(desc(targets.createdAt));
  }

  async getTarget(id: number): Promise<(Target & { logs: Log[] }) | undefined> {
    const [target] = await db.select().from(targets).where(eq(targets.id, id));
    if (!target) return undefined;

    const targetLogs = await db.select().from(logs).where(eq(logs.targetId, id)).orderBy(desc(logs.createdAt));
    return { ...target, logs: targetLogs };
  }

  async createTarget(insertTarget: InsertTarget): Promise<Target> {
    const [target] = await db.insert(targets).values(insertTarget).returning();
    return target;
  }

  async updateTarget(id: number, updates: Partial<InsertTarget> & { progress?: number; isComplete?: boolean }): Promise<Target | undefined> {
    const [updated] = await db.update(targets)
      .set(updates)
      .where(eq(targets.id, id))
      .returning();
    return updated;
  }

  async deleteTarget(id: number): Promise<void> {
    await db.delete(logs).where(eq(logs.targetId, id)); // Clean up logs first
    await db.delete(targets).where(eq(targets.id, id));
  }

  async deleteAllData(): Promise<void> {
    await db.delete(logs);
    await db.delete(targets);
  }

  async getLogs(targetId: number): Promise<Log[]> {
    return await db.select().from(logs).where(eq(logs.targetId, targetId)).orderBy(desc(logs.createdAt));
  }

  async createLog(insertLog: InsertLog): Promise<Log> {
    const [log] = await db.insert(logs).values(insertLog).returning();
    return log;
  }
}

export const storage = new DatabaseStorage();
