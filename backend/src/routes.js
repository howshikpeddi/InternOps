// backend/src/routes.js

// =============================================
// IMPORTS - All route imports at the top
// =============================================
const userRoutes = require('./modules/users/routes');
// const authRoutes = require('./modules/auth/routes');
// const teamRoutes = require('./modules/team/routes');
// const taskRoutes = require('./modules/tasks/routes');
// const attendanceRoutes = require('./modules/attendance/routes');
// ... other imports

// =============================================
// MAIN ROUTES PLUGIN
// =============================================
async function routes(fastify, options) {
  // Register all module routes
  fastify.register(userRoutes);
  // fastify.register(authRoutes);
  // fastify.register(teamRoutes);
  // fastify.register(taskRoutes);
  // fastify.register(attendanceRoutes);
  // ... other route registrations

  // =============================================
  // ROOT ROUTES
  // =============================================
  fastify.get('/ping', async (request, reply) => {
    return reply.send({ pong: true, timestamp: new Date().toISOString() });
  });

  fastify.get('/status', async (request, reply) => {
    return reply.send({
      status: 'ok',
      version: 'v1',
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // =============================================
  // HEALTH CHECKS
  // =============================================
  fastify.get('/health', async (request, reply) => {
    // Simple health check - will be overridden by global health route
    return reply.send({ status: 'ok' });
  });

  // =============================================
  // FALLBACK ROUTE FOR UNMATCHED PATHS
  // =============================================
  fastify.all('*', async (request, reply) => {
    reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
    });
  });
}

module.exports = routes;
