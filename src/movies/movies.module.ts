import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Actor } from '../actors/entities/actor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie, Actor]), // Register Movie and Actor entities
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService, TypeOrmModule.forFeature([Movie])],
})
export class MoviesModule {}
