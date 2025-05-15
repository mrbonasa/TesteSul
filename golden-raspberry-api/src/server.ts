import { buildApp } from './app';
import { sequelize } from './database'; 

const PORT = process.env.PORT || 3000;

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: Number(PORT), host: '0.0.0.0' }); 
    app.log.info(`Servidor rodando em http://localhost:${PORT}`);
    app.log.info(`Endpoint de prêmios: http://localhost:${PORT}/producers`);
  } catch (err) {
    app.log.error(err);
    await sequelize.close(); 
    process.exit(1);
  }
  
  const signals = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      app.log.info(`Recebido ${signal}. Fechando o servidor...`);
      await app.close();
      await sequelize.close();
      app.log.info('Servidor e conexão com banco de dados fechados.');
      process.exit(0);
    });
  });
}

start();