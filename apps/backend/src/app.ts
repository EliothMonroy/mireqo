import Fastify, { type FastifyError } from 'fastify';
import swagger from '@fastify/swagger';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { HealthSchema, ErrorSchema } from '@mireqo/contracts';
export async function createApp(
  checkReady: () => Promise<void>,
  logging = false,
) {
  const app = Fastify({
    logger: logging,
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
  app.get('/v1/openapi.json', { schema: { hide: true } }, async () =>
    app.swagger(),
  );
  return app;
}
