import { Module } from '@nestjs/common';
import { ActorsService } from './actors.service';
import { ActorsController } from './actors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actor } from './entities/actor.entity';
import { Movie } from '../movies/entities/movie.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Actor, Movie]), // Register Actor and Movie entities
  ],
  controllers: [ActorsController],
  providers: [ActorsService],
  exports: [ActorsService, TypeOrmModule.forFeature([Actor])],
})
export class ActorsModule {}
