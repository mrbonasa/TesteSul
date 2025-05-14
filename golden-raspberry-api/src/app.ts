// src/app.ts
import Fastify, { FastifyInstance } from 'fastify';
import awardsRoutes from '@/routes/awardsRoutes';
import { sequelize, loadCsvDataToDatabase } from '@/database'; // Sequelize instance and loader

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true, // Habilita o logger do Fastify
  });

  // Conectar ao banco e carregar dados
  try {
    await sequelize.authenticate();
    app.log.info('Conexão com o banco de dados estabelecida com sucesso.');
    await sequelize.sync(); // Cria tabelas se não existirem (sem { force: true } para não apagar em cada reinício)
    app.log.info('Modelos sincronizados com o banco de dados.');
    await loadCsvDataToDatabase(); // Carrega dados do CSV
    app.log.info('Dados do CSV carregados no banco de dados.');
  } catch (error) {
    app.log.error('Não foi possível conectar ou inicializar o banco de dados:', error);
    // Em um cenário real, você pode querer que a aplicação não inicie se o DB falhar.
    // process.exit(1); // Descomente se for crítico
  }

  // Registrar rotas
  // O prefixo '/producers' será aplicado aqui
  app.register(awardsRoutes, { prefix: '/producers' });

  // Rota raiz para teste
  app.get('/', async (request, reply) => {
    return { message: 'API Golden Raspberry Awards com Fastify e TypeScript está funcionando!' };
  });

  // Tratador de erro global (Fastify tem seu próprio, mas pode ser customizado)
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    // Enviar resposta de erro genérica
    reply.status(error.statusCode || 500).send({
      message: error.message || 'Ocorreu um erro inesperado',
      // statusCode: error.statusCode || 500,
      // error: error.name || 'Internal Server Error'
    });
  });

  return app;
}