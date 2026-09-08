import { CatalogError, type Catalog } from './catalog.ts';
import Fastify, { type FastifyError } from 'fastify';
import swagger from '@fastify/swagger';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import {
  AreasResponseSchema,
  EventsResponseSchema,
  EventsQuerySchema,
  HealthSchema,
  ErrorSchema,
} from '@mireqo/contracts';
export async function createApp(
  checkReady: () => Promise<void>,
  logging = false,
  catalog?: Catalog,
) {
  const app = Fastify({
    logger: logging,
    ajv: { customOptions: { removeAdditional: false } },
    disableRequestLogging: true,
  }).withTypeProvider<TypeBoxTypeProvider>();
  await app.register(swagger, {
    openapi: { info: { title: 'Mireqo API', version: '1.0.0' } },
  });
  app.setErrorHandler<FastifyError>((error, request, reply) => {
    const validation = error.validation || error.statusCode === 400;
    request.log.warn(
      { code: validation ? 'INVALID_REQUEST' : 'INTERNAL_ERROR' },
      'Request failed',
    );
    reply.code(validation ? 400 : 500).send({
      error: {
        code: validation ? 'INVALID_REQUEST' : 'INTERNAL_ERROR',
        message: validation ? 'Invalid request' : 'Internal server error',
      },
    });
  });
  app.setNotFoundHandler((_request, reply) =>
    reply
      .code(404)
      .send({ error: { code: 'NOT_FOUND', message: 'Route not found' } }),
  );
  app.get(
    '/v1/health',
    { schema: { response: { 200: HealthSchema } } },
    async () => ({ status: 'ok' as const }),
  );
  app.get(
    '/v1/ready',
    { schema: { response: { 200: HealthSchema, 503: ErrorSchema } } },
    async (_request, reply) => {
      try {
        await checkReady();
        return { status: 'ok' as const };
      } catch {
        return reply.code(503).send({
          error: { code: 'NOT_READY', message: 'Database is not ready' },
        });
      }
    },
  );
  const failure = (error: unknown) =>
    error instanceof CatalogError
      ? error
      : new CatalogError(
          503,
          'CATALOG_UNAVAILABLE',
          'Catalog is temporarily unavailable',
        );
  app.get(
    '/v1/areas',
    {
      schema: {
        response: {
          200: AreasResponseSchema,
          503: ErrorSchema,
          500: ErrorSchema,
        },
      },
    },
    async (_request, reply) => {
      try {
        if (!catalog) throw new Error();
        return await catalog.areas();
      } catch (error) {
        const problem = failure(error);
        return reply
          .code(503)
          .send({ error: { code: problem.code, message: problem.message } });
      }
    },
  );
  app.get(
    '/v1/events',
    {
      schema: {
        querystring: EventsQuerySchema,
        response: {
          200: EventsResponseSchema,
          400: ErrorSchema,
          404: ErrorSchema,
          503: ErrorSchema,
          500: ErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        if (!catalog) throw new Error();
        return await catalog.events(request.query);
      } catch (error) {
        const problem = failure(error);
        return reply
          .code(problem.statusCode as 400 | 404 | 503)
          .send({ error: { code: problem.code, message: problem.message } });
      }
    },
  );
  app.get('/v1/openapi.json', { schema: { hide: true } }, async () =>
    app.swagger(),
  );
  return app;
}
