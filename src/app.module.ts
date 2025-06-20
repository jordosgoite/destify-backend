import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Movie } from './movies/entities/movie.entity';
import { Actor } from './actors/entities/actor.entity';
import { MovieRating } from './movie-ratings/entities/movie-rating.entity';
import { MoviesModule } from './movies/movies.module';
import { ActorsModule } from './actors/actors.module';
import { MovieRatingsModule } from './movie-ratings/movie-ratings.module';
import { AppService } from './app.service'; // For seeding
import { AuthModule } from './auth/auth.module'; // Import AuthModule
import { User } from './auth/entities/user.entity'; // Import User entity
import { APP_GUARD } from '@nestjs/core'; // Import APP_GUARD and Reflector
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'; // Import JwtAuthGuard

@Module({
  imports: [
    // Configure ConfigModule to load .env files
    ConfigModule.forRoot({
      isGlobal: true, // Makes the ConfigService available throughout the application
      envFilePath: ['.env'], // Specify the path to your .env file
    }),
    // Configure TypeORM for SQLite
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'sqlite', // Changed database type to SQLite
        database: config.get<string>('DB_DATABASE', 'movie.sqlite'), // Use a file path for SQLite database
        entities: [Movie, Actor, MovieRating, User], // Register all your entities here, including User
        synchronize: true, // Automatically synchronize database schema (for development only!)
        logging: false, // Set to true to see SQL queries in console
      }),
    }),
    // TypeOrmModule.forFeature([Movie, Actor]), // This is no longer needed here as AppService constructor will get Repositories injected via their respective modules (MoviesModule, ActorsModule, MovieRatingsModule)
    MoviesModule,
    ActorsModule,
    MovieRatingsModule,
    AuthModule, // Add AuthModule
  ],
  providers: [
    AppService, // AppService will contain the seeding logic
    {
      provide: APP_GUARD, // This token makes it a global guard
      useClass: JwtAuthGuard, // Use our JwtAuthGuard
      // NestJS will automatically inject Reflector and other dependencies for APP_GUARD
    },
  ],
})
export class AppModule {}
