import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function seedDatabase() {
  const existing = await storage.getPlants();
  if (existing.length === 0) {
    const seedPlants = [
      {
        name: "Tomato",
        type: "Vegetable",
        spacing: 24,
        sunlight: "Full Sun",
        water: "1-2 inches per week",
        fertilizer: "High phosphorus/potassium",
        companionPlants: ["Basil", "Marigold", "Carrot", "Onion"],
        incompatiblePlants: ["Potato", "Cabbage", "Corn"]
      },
      {
        name: "Basil",
        type: "Herb",
        spacing: 12,
        sunlight: "Full Sun",
        water: "Keep soil moist",
        fertilizer: "Balanced organic",
        companionPlants: ["Tomato", "Pepper", "Oregano"],
        incompatiblePlants: ["Rue"]
      },
      {
        name: "Carrot",
        type: "Vegetable",
        spacing: 3,
        sunlight: "Full to Partial Sun",
        water: "1 inch per week",
        fertilizer: "Low nitrogen",
        companionPlants: ["Tomato", "Onion", "Rosemary", "Lettuce"],
        incompatiblePlants: ["Dill", "Parsnip"]
      },
      {
        name: "Marigold",
        type: "Flower",
        spacing: 10,
        sunlight: "Full Sun",
        water: "Allow soil to dry between watering",
        fertilizer: "Light balanced fertilizer",
        companionPlants: ["Tomato", "Cucumber", "Melon", "Squash"],
        incompatiblePlants: []
      },
      {
        name: "Lettuce",
        type: "Vegetable",
        spacing: 6,
        sunlight: "Partial Shade",
        water: "Keep soil consistently moist",
        fertilizer: "High nitrogen",
        companionPlants: ["Carrot", "Radish", "Strawberry"],
        incompatiblePlants: ["Cabbage", "Parsley"]
      },
      {
        name: "Pepper",
        type: "Vegetable",
        spacing: 18,
        sunlight: "Full Sun",
        water: "1-2 inches per week",
        fertilizer: "Balanced, then high phosphorus",
        companionPlants: ["Basil", "Onion", "Spinach", "Tomato"],
        incompatiblePlants: ["Beans", "Fennel"]
      },
      {
        name: "Cucumber",
        type: "Vegetable",
        spacing: 12,
        sunlight: "Full Sun",
        water: "1-2 inches per week",
        fertilizer: "High nitrogen then balanced",
        companionPlants: ["Radish", "Sunflower", "Marigold"],
        incompatiblePlants: ["Potato", "Sage"]
      }
    ];
    for (const p of seedPlants) {
      await storage.createPlant(p);
    }
  }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  seedDatabase().catch(console.error);

  app.get(api.plants.list.path, async (req, res) => {
    const plantsList = await storage.getPlants();
    res.json(plantsList);
  });

  app.post(api.plants.create.path, async (req, res) => {
    try {
      const input = api.plants.create.input.extend({
        spacing: z.coerce.number().min(1),
      }).parse(req.body);
      const plant = await storage.createPlant(input);
      res.status(201).json(plant);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete('/api/plants/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id < 1) {
      return res.status(400).json({ message: "Invalid plant ID" });
    }
    await storage.deletePlant(id);
    res.status(204).send();
  });

  app.get(api.location.get.path, async (req, res) => {
    const city = (req.query.city as string) || "Unknown";
    const state = (req.query.state as string) || "Unknown";
    
    let zone = "Zone 6b";
    let firstFrost = "October 15";
    let lastFrost = "April 20";
    
    const s = state.toLowerCase();
    if (s.includes("fl") || s.includes("tx") || s.includes("florida") || s.includes("texas") || s.includes("ca") || s.includes("california")) {
      zone = "Zone 9b";
      firstFrost = "December 15";
      lastFrost = "February 10";
    } else if (s.includes("ny") || s.includes("new york") || s.includes("il") || s.includes("illinois") || s.includes("pa") || s.includes("pennsylvania")) {
      zone = "Zone 5b";
      firstFrost = "October 10";
      lastFrost = "May 1";
    }

    res.json({
      zone,
      firstFrost,
      lastFrost,
      notes: `Based on your location in ${city}, ${state}, you are in ${zone}.`
    });
  });

  return httpServer;
}
