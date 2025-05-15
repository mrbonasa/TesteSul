import supertest from 'supertest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '@/app'; 
import { sequelize, Movie, loadCsvDataToDatabase } from '@/database';

let app: FastifyInstance;

beforeAll(async () => {
  await sequelize.authenticate(); 
  await sequelize.sync({ force: true });
  await loadCsvDataToDatabase();
  
  app = await buildApp();
  await app.ready(); 
});

afterAll(async () => {
  await app.close();
  await sequelize.close(); 
});

describe('Awards API - /producers endpoint', () => {
  it('should return the producer with the longest and shortest interval between two consecutive awards', async () => {
    const response = await supertest(app.server).get('/producers'); 

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('min');
    expect(response.body).toHaveProperty('max');

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
    await Movie.destroy({ truncate: true, cascade: false }); 
    await Movie.bulkCreate([
      { year: 2000, title: 'Test Movie 1', studios: 'Test Studio', producers: 'Producer A', winner: true },
      { year: 2001, title: 'Test Movie 2', studios: 'Test Studio', producers: 'Producer B', winner: true },
    ]);

    const response = await supertest(app.server).get('/producers');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ min: [], max: [] });
    await Movie.destroy({ truncate: true, cascade: false });
    await loadCsvDataToDatabase();
  });
});