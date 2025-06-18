/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Actor } from '../actors/entities/actor.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Actor) // Inject Actor repository to find actors for relationships
    private readonly actorRepository: Repository<Actor>,
  ) {}

  // Create a new movie
  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    const movie = this.movieRepository.create(createMovieDto);

    if (createMovieDto.actorIds && createMovieDto.actorIds.length > 0) {
      const actors = await this.actorRepository.findBy({
        id: In(createMovieDto.actorIds),
      });
      if (actors.length !== createMovieDto.actorIds.length) {
        throw new NotFoundException(
          'One or more actor IDs provided were not found.',
        );
      }
      movie.actors = actors;
    }

    return this.movieRepository.save(movie);
  }

  // Get all movies
  async findAll(): Promise<Movie[]> {
    return this.movieRepository.find({ relations: ['actors', 'ratings'] });
  }

  // Get a movie by ID
  async findOne(id: string): Promise<Movie> {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['actors', 'ratings'],
    });
    if (!movie) {
      throw new NotFoundException(`Movie with ID "${id}" not found.`);
    }
    return movie;
  }

  // Search movies by title (partial and case-insensitive)
  async search(query: string): Promise<Movie[]> {
    return this.movieRepository.find({
      where: { title: ILike(`%${query}%`) },
      relations: ['actors', 'ratings'],
    });
  }

  // Get all actors for a given movie
  async findActorsInMovie(movieId: string): Promise<Actor[]> {
    const movie = await this.movieRepository.findOne({
      where: { id: movieId },
      relations: ['actors'],
    });
    if (!movie) {
      throw new NotFoundException(`Movie with ID "${movieId}" not found.`);
    }
    return movie.actors;
  }

  // Update a movie
  async update(id: string, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['actors'], // Load existing actors for potential updates
    });
    if (!movie) {
      throw new NotFoundException(`Movie with ID "${id}" not found.`);
    }

    // Update basic properties
    if (updateMovieDto.title) {
      movie.title = updateMovieDto.title;
    }
    if (updateMovieDto.releaseYear) {
      movie.releaseYear = updateMovieDto.releaseYear;
    }

    // Update actors if actorIds are provided
    if (updateMovieDto.actorIds !== undefined) {
      // Check if it's explicitly provided, even if empty array
      if (updateMovieDto.actorIds.length > 0) {
        const actors = await this.actorRepository.findBy({
          id: In(updateMovieDto.actorIds),
        });
        if (actors.length !== updateMovieDto.actorIds.length) {
          throw new NotFoundException(
            'One or more actor IDs provided for update were not found.',
          );
        }
        movie.actors = actors; // Replace existing actors with the new set
      } else {
        movie.actors = []; // Clear all actors if an empty array is provided
      }
    }

    return this.movieRepository.save(movie);
  }

  // Delete a movie
  async remove(id: string): Promise<void> {
    const result = await this.movieRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Movie with ID "${id}" not found.`);
    }
  }
}
