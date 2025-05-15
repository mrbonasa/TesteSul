import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { getAwardIntervals } from '../services/awardsService';

export default async function awardsRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const intervals = await getAwardIntervals();
      reply.status(200).send(intervals);
    } catch (error: any) {
      request.log.error(error); // Use o logger do Fastify
      reply.status(500).send({ message: "Erro interno do servidor", error: error.message });
    }
  });
}