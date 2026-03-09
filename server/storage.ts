import { db } from "./db";
import { plants, type InsertPlant, type Plant } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getPlants(): Promise<Plant[]>;
  createPlant(plant: InsertPlant): Promise<Plant>;
  deletePlant(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getPlants(): Promise<Plant[]> {
    return await db.select().from(plants);
  }
  async createPlant(plant: InsertPlant): Promise<Plant> {
    const [newPlant] = await db.insert(plants).values(plant).returning();
    return newPlant;
  }
  async deletePlant(id: number): Promise<void> {
    await db.delete(plants).where(eq(plants.id, id));
  }
}

export const storage = new DatabaseStorage();
