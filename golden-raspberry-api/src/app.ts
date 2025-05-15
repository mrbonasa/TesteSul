import Fastify, { FastifyInstance } from 'fastify';
import awardsRoutes from './routes/awardsRoutes';
import { sequelize, loadCsvDataToDatabase } from './database'; 

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
  });
 
  try {
    await sequelize.authenticate();
    app.log.info('Conexão com o banco de dados estabelecida com sucesso.');
    await sequelize.sync(); 
    app.log.info('Modelos sincronizados com o banco de dados.');
    await loadCsvDataToDatabase();
    app.log.info('Dados do CSV carregados no banco de dados.');
  } catch (error) {
    app.log.error('Não foi possível conectar ou inicializar o banco de dados:', error);    
  }

  app.register(awardsRoutes, { prefix: '/producers' });

  app.get('/', async (request, reply) => {
    return { message: 'API Golden Raspberry Awards com Fastify e TypeScript está funcionando!' };
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    reply.status(error.statusCode || 500).send({
      message: error.message || 'Ocorreu um erro inesperado',
    });
  });

  return app;
}