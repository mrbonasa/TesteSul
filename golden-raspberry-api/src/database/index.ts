import { Sequelize } from 'sequelize';
import Movie, { initMovieModel } from './Movie';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const CSV_FILE_PATH = path.join(__dirname, '..', '..', 'data', 'movielist.csv');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:', // Banco de dados em memória
  logging: false, // false para não logar SQL no console, ou console.log para logar
});

const MovieModel = initMovieModel(sequelize);

export { sequelize, MovieModel as Movie };
function parseProducersString(producersString: string | undefined): string[] {
    if (!producersString || producersString.trim() === '') return [];
    const standardizedString = producersString.replace(/\s+and\s+/gi, ', ');
    return standardizedString.split(/,\s*/)
                             .map(p => p.trim())
                             .filter(p => p.length > 0);
}

export const loadCsvDataToDatabase = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    //const moviesToInsert: Array<Omit<InstanceType<typeof Movie>, 'id'>> = [];

    type MovieInput = Omit<Movie['_creationAttributes'], 'id'>;
    const moviesToInsert: MovieInput[] = [];

    let firstRow = true;

    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv({ separator: ';' }))
      .on('data', (row: any) => {
        if (firstRow && row.year && row.year.toLowerCase() === 'year') {
          firstRow = false; // Ignora o cabeçalho
          return;
        }

        const year = parseInt(row.year, 10);
        const title = row.title;
        const studios = row.studios;
        const producers = row.producers; // String original
        const winner = (row.winner && row.winner.toLowerCase() === 'yes');

        if (isNaN(year) || !title || !studios || !producers) {
          // console.warn(`Linha inválida ou incompleta no CSV, pulando: ${JSON.stringify(row)}`);
          return;
        }
        
        moviesToInsert.push({
          year,
          title,
          studios,
          producers,
          winner,
        });
      })
      .on('end', async () => {
        try {
          await MovieModel.bulkCreate(moviesToInsert);
          console.log('Arquivo CSV processado e dados inseridos no banco.');
          resolve();
        } catch (error) {
          console.error('Erro ao inserir dados do CSV no banco:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Erro ao ler o arquivo CSV:', error);
        reject(error);
      });
  });
}