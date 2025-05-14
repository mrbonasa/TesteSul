import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface MovieAttributes {
  id: number;
  year: number;
  title: string;
  studios: string;
  producers: string; 
  winner: boolean;
}


interface MovieCreationAttributes extends Optional<MovieAttributes, 'id'> {}

class Movie extends Model<MovieAttributes, MovieCreationAttributes> implements MovieAttributes {
  public id!: number;
  public year!: number;
  public title!: string;
  public studios!: string;
  public producers!: string;
  public winner!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getIndividualProducers(): string[] {
    if (!this.producers || this.producers.trim() === '') return [];
    const standardizedString = this.producers.replace(/\s+and\s+/gi, ', ');
    return standardizedString.split(/,\s*/)
                             .map(p => p.trim())
                             .filter(p => p.length > 0);
  }
}

export const initMovieModel = (sequelize: Sequelize): typeof Movie => { 
  Movie.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      studios: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      producers: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      winner: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: 'movies',
    }
  );
  return Movie;
};

export default Movie;