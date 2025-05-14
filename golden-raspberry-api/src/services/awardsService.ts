// src/services/awardsService.ts
import { Movie } from '@/database'; // Usando alias do tsconfig

interface AwardInterval {
  producer: string;
  interval: number;
  previousWin: number;
  followingWin: number;
}

interface AwardIntervalsResult {
  min: AwardInterval[];
  max: AwardInterval[];
}

export const getAwardIntervals = async (): Promise<AwardIntervalsResult> => {
  const winningMovies = await Movie.findAll({
    where: { winner: true },
    order: [['year', 'ASC']],
  });

  const producerWins: { [key: string]: number[] } = {}; // { "Producer Name": [year1, year2, ...] }

  winningMovies.forEach(movieInstance => {
    const individualProducers = movieInstance.getIndividualProducers();
    individualProducers.forEach(producerName => {
      if (!producerWins[producerName]) {
        producerWins[producerName] = [];
      }
      // Adiciona o ano apenas se ainda não estiver na lista
      if (!producerWins[producerName].includes(movieInstance.year)) {
        producerWins[producerName].push(movieInstance.year);
      }
    });
  });

  const intervals: AwardInterval[] = [];
  for (const producer in producerWins) {
    const wins = producerWins[producer].sort((a, b) => a - b); // Garante a ordenação dos anos
    if (wins.length >= 2) {
      for (let i = 0; i < wins.length - 1; i++) {
        const previousWin = wins[i];
        const followingWin = wins[i + 1];
        intervals.push({
          producer: producer,
          interval: followingWin - previousWin,
          previousWin: previousWin,
          followingWin: followingWin,
        });
      }
    }
  }

  if (intervals.length === 0) {
    return { min: [], max: [] };
  }

  let minIntervalValue = Infinity;
  intervals.forEach(i => {
    if (i.interval < minIntervalValue) {
      minIntervalValue = i.interval;
    }
  });
  const min = intervals.filter(i => i.interval === minIntervalValue);

  let maxIntervalValue = -Infinity;
  intervals.forEach(i => {
    if (i.interval > maxIntervalValue) {
      maxIntervalValue = i.interval;
    }
  });
  const max = intervals.filter(i => i.interval === maxIntervalValue);

  return { min, max };
};