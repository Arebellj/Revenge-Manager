import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const targets = pgTable("targets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  reason: text("reason").notNull(), // What they did
  plan: text("plan").notNull(), // What user wants to do
  progress: integer("progress").default(0).notNull(), // 0-100
  isComplete: boolean("is_complete").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  targetId: integer("target_id").notNull(),
  description: text("description").notNull(), // Log of what user did
  createdAt: timestamp("created_at").defaultNow(),
});

export const targetsRelations = relations(targets, ({ many }) => ({
  logs: many(logs),
}));

export const logsRelations = relations(logs, ({ one }) => ({
  target: one(targets, {
    fields: [logs.targetId],
    references: [targets.id],
  }),
}));

export const insertTargetSchema = createInsertSchema(targets).omit({ id: true, createdAt: true, isComplete: true });
export const insertLogSchema = createInsertSchema(logs).omit({ id: true, createdAt: true });

export type Target = typeof targets.$inferSelect;
export type InsertTarget = z.infer<typeof insertTargetSchema>;
export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;
