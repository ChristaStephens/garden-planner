import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const plants = pgTable("plants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  spacing: integer("spacing").notNull(), // in inches
  sunlight: text("sunlight").notNull(),
  water: text("water").notNull(),
  fertilizer: text("fertilizer").notNull(),
  companionPlants: jsonb("companion_plants").$type<string[]>().notNull(),
  incompatiblePlants: jsonb("incompatible_plants").$type<string[]>().notNull(),
});

export const insertPlantSchema = createInsertSchema(plants).omit({ id: true });

export type InsertPlant = z.infer<typeof insertPlantSchema>;
export type Plant = typeof plants.$inferSelect;
