import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovieRating } from './entities/movie-rating.entity';
import { CreateMovieRatingDto } from './dto/create-movie-rating.dto';
import { UpdateMovieRatingDto } from './dto/update-movie-rating.dto';
import { Movie } from '../movies/entities/movie.entity';

@Injectable()
export class MovieRatingsService {
  constructor(
    @InjectRepository(MovieRating)
    private readonly movieRatingRepository: Repository<MovieRating>,
    @InjectRepository(Movie) // Inject Movie repository to link ratings to movies
    private readonly movieRepository: Repository<Movie>,
  ) {}

  // Create a new movie rating
  async create(
    createMovieRatingDto: CreateMovieRatingDto,
  ): Promise<MovieRating> {
    const movie = await this.movieRepository.findOneBy({
      id: createMovieRatingDto.movieId,
    });
    if (!movie) {
      throw new NotFoundException(
        `Movie with ID "${createMovieRatingDto.movieId}" not found.`,
      );
    }

    const movieRating = this.movieRatingRepository.create({
      rating: createMovieRatingDto.rating,
      review: createMovieRatingDto.review,
      movie: movie, // Link the rating to the found movie
    });

    return this.movieRatingRepository.save(movieRating);
  }

  // Get all movie ratings
  async findAll(): Promise<MovieRating[]> {
    return this.movieRatingRepository.find({ relations: ['movie'] });
  }

  // Get a movie rating by ID
  async findOne(id: string): Promise<MovieRating> {
    const movieRating = await this.movieRatingRepository.findOne({
      where: { id },
      relations: ['movie'],
    });
    if (!movieRating) {
      throw new NotFoundException(`Movie rating with ID "${id}" not found.`);
    }
    return movieRating;
  }

  // Update a movie rating
  async update(
    id: string,
    updateMovieRatingDto: UpdateMovieRatingDto,
  ): Promise<MovieRating> {
    const movieRating = await this.movieRatingRepository.preload({
      id,
      ...updateMovieRatingDto,
    });
    if (!movieRating) {
      throw new NotFoundException(`Movie rating with ID "${id}" not found.`);
    }
    return this.movieRatingRepository.save(movieRating);
  }

  // Delete a movie rating
  async remove(id: string): Promise<void> {
    const result = await this.movieRatingRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Movie rating with ID "${id}" not found.`);
    }
  }
}
