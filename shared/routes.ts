import { z } from 'zod';
import { plants } from './schema';

export const api = {
  plants: {
    list: {
      method: 'GET' as const,
      path: '/api/plants' as const,
      responses: {
        200: z.array(z.custom<typeof plants.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/plants' as const,
      input: z.object({
        name: z.string().min(1),
        type: z.string().min(1),
        spacing: z.number().min(1),
        sunlight: z.string().min(1),
        water: z.string().min(1),
        fertilizer: z.string().min(1),
        companionPlants: z.array(z.string()),
        incompatiblePlants: z.array(z.string()),
      }),
      responses: {
        201: z.custom<typeof plants.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/plants/:id' as const,
      responses: {
        204: z.void(),
      },
    },
  },
  location: {
    get: {
      method: 'GET' as const,
      path: '/api/location' as const,
      input: z.object({
        city: z.string().optional(),
        state: z.string().optional(),
      }).optional(),
      responses: {
        200: z.object({
          zone: z.string(),
          firstFrost: z.string(),
          lastFrost: z.string(),
          notes: z.string(),
        }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
