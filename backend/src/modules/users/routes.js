// backend/src/modules/users/routes.js

const UserRepository = require('./repository');
const pool = require('../../config/db');

/**
 * User routes - Registered as a Fastify plugin
 * @param {FastifyInstance} fastify - The Fastify instance
 * @param {Object} options - Plugin options
 */
async function userRoutes(fastify, options) {
  // Initialize repository with database pool
  const userRepository = new UserRepository(pool);

  // =============================================
  // GET /users - Paginated, searchable, sortable user list
  // =============================================
  fastify.get(
    '/users',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            search: { type: 'string', maxLength: 100 },
            sortBy: {
              type: 'string',
              enum: ['name', 'created_at', 'last_login'],
            },
            sortOrder: { type: 'string', enum: ['asc', 'desc'] },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              data: { type: 'array' },
              page: { type: 'number' },
              limit: { type: 'number' },
              total: { type: 'number' },
              totalPages: { type: 'number' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { page, limit, search, sortBy, sortOrder } = request.query;

        const result = await userRepository.findPaginated({
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 20,
          search,
          sortBy: sortBy || 'created_at',
          sortOrder: sortOrder || 'asc',
        });

        return reply.send(result);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Failed to fetch users',
          message: error.message,
        });
      }
    }
  );

  // =============================================
  // GET /users/:id - Get single user
  // =============================================
  fastify.get(
    '/users/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const result = await userRepository.findById(id);
        if (!result) {
          return reply.status(404).send({ error: 'User not found' });
        }
        return reply.send(result);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch user' });
      }
    }
  );

  // =============================================
  // POST /users - Create user
  // =============================================
  fastify.post(
    '/users',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', minLength: 2 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'INTERN'] },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const userData = request.body;
        const result = await userRepository.create(userData);
        return reply.status(201).send(result);
      } catch (error) {
        request.log.error(error);
        if (error.code === '23505') {
          // Unique violation
          return reply
            .status(409)
            .send({ error: 'User with this email already exists' });
        }
        return reply.status(500).send({ error: 'Failed to create user' });
      }
    }
  );

  // =============================================
  // PUT /users/:id - Update user
  // =============================================
  fastify.put(
    '/users/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 2 },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'INTERN'] },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const updates = request.body;
        const result = await userRepository.update(id, updates);
        if (!result) {
          return reply.status(404).send({ error: 'User not found' });
        }
        return reply.send(result);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to update user' });
      }
    }
  );

  // =============================================
  // DELETE /users/:id - Delete user
  // =============================================
  fastify.delete(
    '/users/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const result = await userRepository.delete(id);
        if (!result) {
          return reply.status(404).send({ error: 'User not found' });
        }
        return reply.status(204).send();
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to delete user' });
      }
    }
  );
}

module.exports = userRoutes;
