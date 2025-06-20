/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common'; // Import ValidationPipe
import { DataSource } from 'typeorm'; // Import DataSource
import { LoginUserDto } from '../src/auth/dto/login-user.dto';
import { UpdateMovieDto } from './../src/movies/dto/update-movie.dto';
import { UpdateActorDto } from '../src/actors/dto/update-actor.dto';
import { UpdateMovieRatingDto } from '../src/movie-ratings/dto/update-movie-rating.dto';
import { AppService } from '../src/app.service'; // Import AppService for re-seeding

describe('MovieAPI (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let movieId: string;
  let actorId: string;
  let movieRatingId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    ); // Corrected typo
    await app.init();

    // Get the DataSource
    const connection = app.get(DataSource);

    // Clear the database to ensure a clean slate for seeding
    await connection.synchronize(true);

    // Re-seed the default user and other data for tests.
    // AppService.onModuleInit() calls seedDatabase which checks if data already exists.
    // By calling it after synchronize(true), it ensures the default user is created for tests.
    const appService = app.get(AppService);
    await appService.onModuleInit();

    // Log in to get a JWT token for protected routes
    const loginDto: LoginUserDto = {
      username: 'testuser',
      password: 'password123',
    };
    const authRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(HttpStatus.OK);

    jwtToken = authRes.body.access_token;
    expect(jwtToken).toBeDefined();
    console.log('Obtained JWT Token for E2E tests.');
  });

  afterAll(async () => {
    await app.close();
  });

  // --- Movies E2E Tests ---
  describe('/movies (POST)', () => {
    it('should create a movie', async () => {
      const res = await request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ title: 'Test Movie', releaseYear: 2023 })
        .expect(HttpStatus.CREATED);
      expect(res.body.title).toEqual('Test Movie');
      movieId = res.body.id; // Save movie ID for later tests
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
          expect(res.body.length).toBeGreaterThanOrEqual(1); // At least the seeded movie + created test movie
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
          expect(res.body.title).toEqual('Test Movie');
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
        .get('/movies/search?query=test')
        .expect(HttpStatus.OK);
      expect(Array.isArray(res.body)).toBe(true);
      expect(
        res.body.some(
          (movie: { title: string }) => movie.title === 'Test Movie',
        ),
      ).toBe(true);
    });
  });

  describe('/movies/:id (PUT)', () => {
    it('should update a movie', async () => {
      const updateDto: UpdateMovieDto = {
        title: 'Updated Test Movie',
        releaseYear: 2020,
      };
      const res = await request(app.getHttpServer())
        .put(`/movies/${movieId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK);
      expect(res.body.title).toEqual('Updated Test Movie');
      expect(res.body.releaseYear).toEqual(2020);
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
        .send({ name: 'Test Actor', birthYear: 1990 })
        .expect(HttpStatus.CREATED);
      expect(res.body.name).toEqual('Test Actor');
      actorId = res.body.id; // Save actor ID for later tests
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
        });
    });
  });

  describe('/actors/search?query= (GET)', () => {
    it('should return actors matching the search query', async () => {
      const res = await request(app.getHttpServer())
        .get('/actors/search?query=test')
        .expect(HttpStatus.OK);
      expect(Array.isArray(res.body)).toBe(true);
      expect(
        res.body.some((actor: { name: string }) => actor.name === 'Test Actor'),
      ).toBe(true);
    });
  });

  describe('/actors/:id (PUT)', () => {
    it('should update an actor', async () => {
      const updateDto: UpdateActorDto = { name: 'Updated Actor Name' };
      const res = await request(app.getHttpServer())
        .put(`/actors/${actorId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK);
      expect(res.body.name).toEqual('Updated Actor Name');
    });
  });

  // --- Movie Ratings E2E Tests ---
  describe('/movie-ratings (POST)', () => {
    it('should create a movie rating', async () => {
      const res = await request(app.getHttpServer())
        .post('/movie-ratings')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ movieId: movieId, rating: 4, review: 'Good movie' })
        .expect(HttpStatus.CREATED);
      expect(res.body.rating).toEqual(4);
      expect(res.body.movie.id).toEqual(movieId);
      movieRatingId = res.body.id; // Save rating ID
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
        review: 'Excellent movie!',
      };
      const res = await request(app.getHttpServer())
        .put(`/movie-ratings/${movieRatingId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK);
      expect(res.body.rating).toEqual(5);
      expect(res.body.review).toEqual('Excellent movie!');
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

    it('should delete the test actor', () => {
      return request(app.getHttpServer())
        .delete(`/actors/${actorId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should delete the test movie', () => {
      return request(app.getHttpServer())
        .delete(`/movies/${movieId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.NO_CONTENT);
    });
  });
});
