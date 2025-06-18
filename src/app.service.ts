import { Injectable, OnModuleInit } from '@nestjs/common';
import { MoviesService } from './movies/movies.service';
import { ActorsService } from './actors/actors.service';
import { MovieRatingsService } from './movie-ratings/movie-ratings.service';
import { CreateMovieDto } from './movies/dto/create-movie.dto';
import { CreateActorDto } from './actors/dto/create-actor.dto';
import { CreateMovieRatingDto } from './movie-ratings/dto/create-movie-rating.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movies/entities/movie.entity';
import { Actor } from './actors/entities/actor.entity';
import { User } from './auth/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly actorsService: ActorsService,
    private readonly movieRatingsService: MovieRatingsService,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Actor)
    private readonly actorRepository: Repository<Actor>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedDatabase();
  }
  getHello(): string {
    return 'Hello from Movie API Backend!';
  }

  // Seeding the database with sample data
  private async seedDatabase() {
    console.log('Checking for existing data to seed...');

    const moviesCount = await this.movieRepository.count();
    const actorsCount = await this.actorRepository.count();
    const usersCount = await this.userRepository.count();

    if (usersCount === 0) {
      console.log('No users found. Seeding a default user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      const defaultUser = this.userRepository.create({
        username: 'testuser',
        password: hashedPassword,
      });
      await this.userRepository.save(defaultUser);
      console.log('Default user "testuser" seeded.');
    }

    if (moviesCount === 0 && actorsCount === 0) {
      console.log('Database is empty. Seeding with sample data...');

      // Create Actors
      const actor1Dto: CreateActorDto = { name: 'Tom Hanks', birthYear: 1956 };
      const actor2Dto: CreateActorDto = {
        name: 'Meryl Streep',
        birthYear: 1949,
      };
      const actor3Dto: CreateActorDto = {
        name: 'Leonardo DiCaprio',
        birthYear: 1974,
      };
      const actor4Dto: CreateActorDto = {
        name: 'Kate Winslet',
        birthYear: 1975,
      };
      const actor5Dto: CreateActorDto = {
        name: 'Julia Roberts',
        birthYear: 1967,
      };

      const actor1 = await this.actorsService.create(actor1Dto);
      const actor2 = await this.actorsService.create(actor2Dto);
      const actor3 = await this.actorsService.create(actor3Dto);
      const actor4 = await this.actorsService.create(actor4Dto);
      const actor5 = await this.actorsService.create(actor5Dto);

      // Create Movies
      const movie1Dto: CreateMovieDto = {
        title: 'Forrest Gump',
        releaseYear: 1994,
        actorIds: [actor1.id], // Tom Hanks
      };
      const movie2Dto: CreateMovieDto = {
        title: 'The Post',
        releaseYear: 2017,
        actorIds: [actor1.id, actor2.id], // Tom Hanks, Meryl Streep
      };
      const movie3Dto: CreateMovieDto = {
        title: 'Titanic',
        releaseYear: 1997,
        actorIds: [actor3.id, actor4.id], // Leonardo DiCaprio, Kate Winslet
      };
      const movie4Dto: CreateMovieDto = {
        title: 'Erin Brockovich',
        releaseYear: 2000,
        actorIds: [actor5.id], // Julia Roberts
      };
      const movie5Dto: CreateMovieDto = {
        title: 'Inception',
        releaseYear: 2010,
        actorIds: [actor3.id], // Leonardo DiCaprio
      };

      const movie1 = await this.moviesService.create(movie1Dto);
      const movie2 = await this.moviesService.create(movie2Dto);
      const movie3 = await this.moviesService.create(movie3Dto);
      const movie4 = await this.moviesService.create(movie4Dto);
      const movie5 = await this.moviesService.create(movie5Dto);
      console.log(movie4);

      // Create Movie Ratings
      const rating1Dto: CreateMovieRatingDto = {
        movieId: movie1.id,
        rating: 5,
        review: 'An absolute masterpiece!',
      };
      const rating2Dto: CreateMovieRatingDto = {
        movieId: movie2.id,
        rating: 4,
        review: 'Great historical drama.',
      };
      const rating3Dto: CreateMovieRatingDto = {
        movieId: movie3.id,
        rating: 5,
        review: 'Epic love story.',
      };
      const rating4Dto: CreateMovieRatingDto = {
        movieId: movie1.id,
        rating: 4,
        review: 'Very touching film.',
      };
      const rating5Dto: CreateMovieRatingDto = {
        movieId: movie5.id,
        rating: 5,
        review: 'Mind-bending!',
      };

      await this.movieRatingsService.create(rating1Dto);
      await this.movieRatingsService.create(rating2Dto);
      await this.movieRatingsService.create(rating3Dto);
      await this.movieRatingsService.create(rating4Dto);
      await this.movieRatingsService.create(rating5Dto);

      console.log('Movie, Actor, and Rating database seeding complete!');
    } else {
      console.log(
        'Database already contains movie/actor data. Skipping movie/actor/rating seeding.',
      );
    }
  }
}
