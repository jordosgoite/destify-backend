/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UpdateMovieDto } from './../src/movies/dto/update-movie.dto';
import { UpdateActorDto } from '../src/actors/dto/update-actor.dto';
import { UpdateMovieRatingDto } from '../src/movie-ratings/dto/update-movie-rating.dto';
import { AppModule } from '../src/app.module';
import { AppService } from '../src/app.service';
import { User } from '../src/auth/entities/user.entity';
import { Movie } from '../src/movies/entities/movie.entity';
import { Actor } from '../src/actors/entities/actor.entity';
import { MovieRating } from '../src/movie-ratings/entities/movie-rating.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

describe('MovieAPI (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let movieId: string;
  let actorId: string;
  let movieRatingId: string;

  let userRepository: Repository<User>;
  let movieRepository: Repository<Movie>;
  let actorRepository: Repository<Actor>;
  let movieRatingRepository: Repository<MovieRating>;

  const TEST_JWT_SECRET = 'superSecretJWTKeyForTests';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') {
                return TEST_JWT_SECRET;
              }
              return undefined;
            }),
          },
        },
        {
          provide: AppService,
          useValue: {
            onModuleInit: jest.fn(),
            seedDatabase: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    const connection = app.get(DataSource);
    userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    movieRepository = app.get<Repository<Movie>>(getRepositoryToken(Movie));
    actorRepository = app.get<Repository<Actor>>(getRepositoryToken(Actor));
    movieRatingRepository = app.get<Repository<MovieRating>>(
      getRepositoryToken(MovieRating),
    );
    const jwtService = app.get<JwtService>(JwtService);

    await connection.synchronize(true);

    const hashedPassword = await bcrypt.hash('password123', 10);
    const seededUser = await userRepository.save(
      userRepository.create({
        username: 'testuser',
        password: hashedPassword,
      }),
    );
    console.log('Default user "testuser" manually seeded for e2e tests.');

    const actor1 = await actorRepository.save(
      actorRepository.create({ name: 'E2E Test Actor One', birthYear: 1970 }),
    );

    const movie1 = await movieRepository.save(
      movieRepository.create({
        title: 'E2E Test Movie One',
        releaseYear: 2000,
        actors: [actor1],
      }),
    );

    movieId = movie1.id;
    actorId = actor1.id;

    const rating1 = await movieRatingRepository.save(
      movieRatingRepository.create({
        movie: movie1,
        rating: 4,
        review: 'E2E Test Review for Movie One',
      }),
    );
    movieRatingId = rating1.id;

    const payload = { username: seededUser.username, sub: seededUser.id };
    jwtToken = jwtService.sign(payload);
    expect(jwtToken).toBeDefined();
    console.log('Directly generated JWT Token for E2E tests.');
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // --- Movies E2E Tests ---
  describe('/movies (POST)', () => {
    it('should create a movie', async () => {
      console.log(jwtToken);
      const res = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ title: 'New Test Movie', releaseYear: 2023 })
        .expect(HttpStatus.CREATED);
      expect(res.body.title).toEqual('New Test Movie');
    });

    it('should not create a movie without a token', () => {
      return request(app.getHttpServer())
        .post('/movies')
        .send({ title: 'Unauthorized Movie', releaseYear: 2024 })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should not create a movie with invalid data (e.g., missing title)', () => {
      return request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ releaseYear: 2024 })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/movies (GET)', () => {
    it('should return an array of movies', () => {
      return request(app.getHttpServer())
        .get('/movies')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(1);
        });
    });
  });

  describe('/movies/:id (GET)', () => {
    it('should return a single movie by ID', async () => {
      return request(app.getHttpServer())
        .get(`/movies/${movieId}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.id).toEqual(movieId);
          expect(res.body.title).toEqual('E2E Test Movie One');
        });
    });

    it('should return 404 for a non-existent movie ID', () => {
      return request(app.getHttpServer())
        .get('/movies/non-existent-id')
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('/movies/search?query= (GET)', () => {
    it('should return movies matching the search query', async () => {
      const res = await request(app.getHttpServer())
        .get('/movies/search?query=e2e')
        .expect(HttpStatus.OK);
      expect(Array.isArray(res.body)).toBe(true);
      expect(
        res.body.some(
          (movie: { title: string }) => movie.title === 'E2E Test Movie One',
        ),
      ).toBe(true);
    });
  });

  describe('/movies/:id (PUT)', () => {
    it('should update a movie', async () => {
      const updateDto: UpdateMovieDto = {
        title: 'Updated E2E Test Movie',
        releaseYear: 2005,
      };
      const res = await request(app.getHttpServer())
        .put(`/movies/${movieId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK);
      expect(res.body.title).toEqual('Updated E2E Test Movie');
      expect(res.body.releaseYear).toEqual(2005);
    });

    it('should return 401 for update without token', () => {
      return request(app.getHttpServer())
        .put(`/movies/${movieId}`)
        .send({ title: 'Unauthorized Update' })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 404 for updating a non-existent movie', () => {
      const updateDto: UpdateMovieDto = { title: 'Non Existent' };
      return request(app.getHttpServer())
        .put('/movies/non-existent-id')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateDto)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  // --- Actors E2E Tests ---
  describe('/actors (POST)', () => {
    it('should create an actor', async () => {
      const res = await request(app.getHttpServer())
        .post('/actors')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ name: 'New Test Actor', birthYear: 1990 })
        .expect(HttpStatus.CREATED);
      expect(res.body.name).toEqual('New Test Actor');
    });
  });

  describe('/actors (GET)', () => {
    it('should return an array of actors', () => {
      return request(app.getHttpServer())
        .get('/actors')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(1);
        });
    });
  });

  describe('/actors/:id (GET)', () => {
    it('should return a single actor by ID', () => {
      return request(app.getHttpServer())
        .get(`/actors/${actorId}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.id).toEqual(actorId);
          expect(res.body.name).toEqual('E2E Test Actor One');
        });
    });
  });

  describe('/actors/search?query= (GET)', () => {
    it('should return actors matching the search query', async () => {
      const res = await request(app.getHttpServer())
        .get('/actors/search?query=e2e')
        .expect(HttpStatus.OK);
      expect(Array.isArray(res.body)).toBe(true);
      expect(
        res.body.some(
          (actor: { name: string }) => actor.name === 'E2E Test Actor One',
        ),
      ).toBe(true);
    });
  });

  describe('/actors/:id (PUT)', () => {
    it('should update an actor', async () => {
      const updateDto: UpdateActorDto = { name: 'Updated E2E Actor Name' };
      const res = await request(app.getHttpServer())
        .put(`/actors/${actorId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK);
      expect(res.body.name).toEqual('Updated E2E Actor Name');
    });
  });

  // --- Movie Ratings E2E Tests ---
  describe('/movie-ratings (POST)', () => {
    it('should create a new movie rating', async () => {
      const anotherMovie = await movieRepository.save(
        movieRepository.create({
          title: 'Movie for Rating Test',
          releaseYear: 2022,
          actors: [],
        }),
      );

      const res = await request(app.getHttpServer())
        .post('/movie-ratings')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          movieId: anotherMovie.id,
          rating: 4,
          review: 'Good movie for rating',
        })
        .expect(HttpStatus.CREATED);
      expect(res.body.rating).toEqual(4);
      expect(res.body.movie.id).toEqual(anotherMovie.id);
      movieRatingId = res.body.id;
    });
  });

  describe('/movie-ratings (GET)', () => {
    it('should return an array of movie ratings', () => {
      return request(app.getHttpServer())
        .get('/movie-ratings')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(1);
        });
    });
  });

  describe('/movie-ratings/:id (GET)', () => {
    it('should return a single movie rating by ID', () => {
      return request(app.getHttpServer())
        .get(`/movie-ratings/${movieRatingId}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.id).toEqual(movieRatingId);
        });
    });
  });

  describe('/movie-ratings/:id (PUT)', () => {
    it('should update a movie rating', async () => {
      const updateDto: UpdateMovieRatingDto = {
        rating: 5,
        review: 'Excellent movie for rating!',
      };
      const res = await request(app.getHttpServer())
        .put(`/movie-ratings/${movieRatingId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK);
      expect(res.body.rating).toEqual(5);
      expect(res.body.review).toEqual('Excellent movie for rating!');
    });
  });

  // --- Clean up: Delete operations (protected) ---
  describe('Clean Up (DELETE)', () => {
    it('should delete the test movie rating', () => {
      return request(app.getHttpServer())
        .delete(`/movie-ratings/${movieRatingId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should delete the test movie', async () => {
      return request(app.getHttpServer())
        .delete(`/movies/${movieId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.NO_CONTENT);
    });
  });
});
