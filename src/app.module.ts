import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Movie } from './movies/entities/movie.entity';
import { Actor } from './actors/entities/actor.entity';
import { MovieRating } from './movie-ratings/entities/movie-rating.entity';
import { MoviesModule } from './movies/movies.module';
import { ActorsModule } from './actors/actors.module';
import { MovieRatingsModule } from './movie-ratings/movie-ratings.module';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    // Configure TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'sqlite',
        database: config.get<string>('DB_DATABASE', 'movie.sqlite'), // file path for SQLite database
        entities: [Movie, Actor, MovieRating, User],
        synchronize: true, // Automatically synchronize database schema (for development only!)
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature([Movie, Actor]),
    MoviesModule,
    ActorsModule,
    MovieRatingsModule,
    AuthModule,
  ],
  providers: [AppService], // AppService will contain the seeding logic
})
export class AppModule {}
