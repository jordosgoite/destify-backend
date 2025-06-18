import { Module } from '@nestjs/common';
import { MovieRatingsService } from './movie-ratings.service';
import { MovieRatingsController } from './movie-ratings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieRating } from './entities/movie-rating.entity';
import { Movie } from '../movies/entities/movie.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MovieRating, Movie]), // Register MovieRating and Movie entities
  ],
  controllers: [MovieRatingsController],
  providers: [MovieRatingsService],
  exports: [MovieRatingsService], // Export MovieRatingsService for seeding
})
export class MovieRatingsModule {}
