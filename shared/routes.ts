import { z } from 'zod';
import { insertTargetSchema, insertLogSchema, targets, logs } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  targets: {
    list: {
      method: 'GET' as const,
      path: '/api/targets',
      responses: {
        200: z.array(z.custom<typeof targets.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/targets/:id',
      responses: {
        200: z.custom<typeof targets.$inferSelect & { logs: typeof logs.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/targets',
      input: insertTargetSchema,
      responses: {
        201: z.custom<typeof targets.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/targets/:id',
      input: insertTargetSchema.partial().extend({
        progress: z.number().min(0).max(100).optional(),
        isComplete: z.boolean().optional(),
      }),
      responses: {
        200: z.custom<typeof targets.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/targets/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  logs: {
    list: {
      method: 'GET' as const,
      path: '/api/targets/:targetId/logs',
      responses: {
        200: z.array(z.custom<typeof logs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/targets/:targetId/logs',
      input: insertLogSchema.omit({ targetId: true }),
      responses: {
        201: z.custom<typeof logs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
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
