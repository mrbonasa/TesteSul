// tests/integration/awards.test.ts
import supertest from 'supertest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '@/app'; // Função que constrói e inicializa o app
import { sequelize, Movie, loadCsvDataToDatabase } from '@/database';

let app: FastifyInstance;

beforeAll(async () => {
  // Em vez de chamar buildApp() que carrega o CSV real,
  // vamos controlar a inicialização do DB para testes.
  // Ou, podemos deixar buildApp carregar, mas garantir que o DB seja limpo.

  // Opção 1: Usar o buildApp e garantir limpeza/re-sincronização
  // await sequelize.sync({ force: true }); // Limpa e recria tabelas
  // await loadCsvDataToDatabase(); // Carrega os dados do CSV novamente
  // app = await buildApp(); // buildApp vai tentar carregar de novo, o que é ok se o sync for 'force:true'
  // OU, melhor, construir o app sem a carga automática de dados no buildApp e controlar aqui:

  // Opção 2: Modificar buildApp para não carregar dados automaticamente, e carregar aqui.
  // Por simplicidade, vamos assumir que buildApp() já lida com a inicialização do DB
  // e o carregamento de dados. Para testes, precisamos garantir um estado consistente.
  
  // Garante que o banco está limpo e os dados são carregados antes de cada suíte de teste.
  // Se buildApp já faz sequelize.sync() e loadCsvDataToDatabase(),
  // precisamos garantir que ele use `{ force: true }` ou que tenhamos um jeito de resetar.
  // Para este exemplo, vamos assumir que o `buildApp` já sincroniza e carrega.
  // Para testes mais isolados, você poderia mockar `loadCsvDataToDatabase` ou ter um `buildTestApp`.

  // A maneira mais robusta para testes é garantir um banco limpo.
  await sequelize.authenticate(); // Garante que a conexão está ok
  await sequelize.sync({ force: true }); // Limpa e recria tabelas
  await loadCsvDataToDatabase(); // Carrega os dados do CSV no banco de teste limpo
  
  app = await buildApp(); // Agora construímos o app com o banco já preparado
  await app.ready(); // Espera o Fastify estar pronto
});

afterAll(async () => {
  await app.close();
  await sequelize.close(); // Crucial para o Jest sair
});

describe('Awards API - /producers endpoint', () => {
  it('should return the producer with the longest and shortest interval between two consecutive awards', async () => {
    const response = await supertest(app.server).get('/producers'); // app.server é o servidor http nativo

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('min');
    expect(response.body).toHaveProperty('max');

    // Verificações baseadas no CSV de exemplo
    // Produtor com menor intervalo: Joel Silver (1990, 1991) -> intervalo 1
    // Produtor com maior intervalo: Matthew Vaughn (2002, 2015) -> intervalo 13
    
    expect(Array.isArray(response.body.min)).toBe(true);
    const minProducerFound = response.body.min.find(
      (item: any) => item.producer === "Joel Silver" && item.interval === 1 && item.previousWin === 1990 && item.followingWin === 1991
    );
    expect(minProducerFound).toBeDefined();
    if (response.body.min.length > 0) {
      expect(response.body.min[0].interval).toBe(1);
    }

    expect(Array.isArray(response.body.max)).toBe(true);
    const maxProducerFound = response.body.max.find(
      (item: any) => item.producer === "Matthew Vaughn" && item.interval === 13 && item.previousWin === 2002 && item.followingWin === 2015
    );
    expect(maxProducerFound).toBeDefined();
    if (response.body.max.length > 0) {
      expect(response.body.max[0].interval).toBe(13);
    }

    if (response.body.min.length > 0) {
      const item = response.body.min[0];
      expect(item).toHaveProperty('producer');
      expect(item).toHaveProperty('interval');
      expect(item).toHaveProperty('previousWin');
      expect(item).toHaveProperty('followingWin');
    }
  });

  it('should return empty min/max arrays if no producer has two awards', async () => {
    // Para este teste, precisamos de um estado de DB sem produtores com múltiplos prêmios.
    // Vamos limpar a tabela Movie e inserir dados que não gerem intervalos.
    await Movie.destroy({ truncate: true, cascade: false }); // Limpa a tabela

    // Adiciona filmes que não criarão um intervalo para nenhum produtor
    await Movie.bulkCreate([
      { year: 2000, title: 'Test Movie 1', studios: 'Test Studio', producers: 'Producer A', winner: true },
      { year: 2001, title: 'Test Movie 2', studios: 'Test Studio', producers: 'Producer B', winner: true },
    ]);

    const response = await supertest(app.server).get('/producers');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ min: [], max: [] });

    // Restaura o estado do DB para outros testes (se houver mais na mesma suíte ou se não usar beforeAll/afterAll para cada)
    // Como estamos usando beforeAll para carregar, este teste afetaria testes subsequentes se não for o último.
    // Por isso, é melhor isolar os testes ou recarregar os dados após.
    // Para simplicidade aqui, vamos recarregar.
    await Movie.destroy({ truncate: true, cascade: false });
    await loadCsvDataToDatabase();
  });
});