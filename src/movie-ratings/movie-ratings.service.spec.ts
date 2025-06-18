import { Test, TestingModule } from '@nestjs/testing';
import { MovieRatingsService } from './movie-ratings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MovieRating } from './entities/movie-rating.entity';
import { Movie } from '../movies/entities/movie.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateMovieRatingDto } from './dto/create-movie-rating.dto';
import { UpdateMovieRatingDto } from './dto/update-movie-rating.dto';

const mockMovieRatingRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

const mockMovieRepository = () => ({
  findOneBy: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('MovieRatingsService', () => {
  let service: MovieRatingsService;
  let movieRatingRepository: MockRepository<MovieRating>;
  let movieRepository: MockRepository<Movie>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieRatingsService,
        {
          provide: getRepositoryToken(MovieRating),
          useValue: mockMovieRatingRepository(),
        },
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository(),
        },
      ],
    }).compile();

    service = module.get<MovieRatingsService>(MovieRatingsService);
    movieRatingRepository = module.get<MockRepository<MovieRating>>(getRepositoryToken(MovieRating));
    movieRepository = module.get<MockRepository<Movie>>(getRepositoryToken(Movie));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a movie rating', async () => {
      const movie = { id: 'movie-uuid', title: 'Test Movie', releaseYear: 2020 };
      const createMovieRatingDto: CreateMovieRatingDto = {
        movieId: movie.id,
        rating: 5,
        review: 'Great movie!',
      };
      const movieRating = { id: 'rating-uuid', ...createMovieRatingDto, movie };

      movieRepository.findOneBy.mockResolvedValue(movie);
      movieRatingRepository.create.mockReturnValue(movieRating);
      movieRatingRepository.save.mockResolvedValue(movieRating);

      expect(await service.create(createMovieRatingDto)).toEqual(movieRating);
      expect(movieRepository.findOneBy).toHaveBeenCalledWith({ id: movie.id });
      expect(movieRatingRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          rating: createMovieRatingDto.rating,
          review: createMovieRatingDto.review,
          movie: movie,
        }),
      );
      expect(movieRatingRepository.save).toHaveBeenCalledWith(movieRating);
    });

    it('should throw NotFoundException if movie does not exist', async () => {
      const createMovieRatingDto: CreateMovieRatingDto = {
        movieId: 'non-existent-movie-uuid',
        rating: 3,
        review: 'Okay',
      };
      movieRepository.findOneBy.mockResolvedValue(null);

      await expect(service.create(createMovieRatingDto)).rejects.toThrow(NotFoundException);
      expect(movieRatingRepository.create).not.toHaveBeenCalled();
      expect(movieRatingRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of movie ratings', async () => {
      const movieRatings = [{ id: '1', rating: 4, review: 'Good', movie: { id: 'm1', title: 'Movie 1' } }];
      movieRatingRepository.find.mockResolvedValue(movieRatings);
      expect(await service.findAll()).toEqual(movieRatings);
      expect(movieRatingRepository.find).toHaveBeenCalledWith({ relations: ['movie'] });
    });
  });

  describe('findOne', () => {
    it('should return a single movie rating', async () => {
      const movieRating = { id: '1', rating: 4, review: 'Good', movie: { id: 'm1', title: 'Movie 1' } };
      movieRatingRepository.findOne.mockResolvedValue(movieRating);
      expect(await service.findOne('1')).toEqual(movieRating);
      expect(movieRatingRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' }, relations: ['movie'] });
    });

    it('should throw NotFoundException if movie rating not found', async () => {
      movieRatingRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a movie rating', async () => {
      const existingRating = { id: '1', rating: 3, review: 'Old', movie: { id: 'm1', title: 'Movie 1' } };
      const updatedRating = { ...existingRating, rating: 4, review: 'Updated' };
      const updateMovieRatingDto: UpdateMovieRatingDto = { rating: 4, review: 'Updated' };

      movieRatingRepository.preload.mockResolvedValue(updatedRating);
      movieRatingRepository.save.mockResolvedValue(updatedRating);

      expect(await service.update('1', updateMovieRatingDto)).toEqual(updatedRating);
      expect(movieRatingRepository.preload).toHaveBeenCalledWith({ id: '1', ...updateMovieRatingDto });
      expect(movieRatingRepository.save).toHaveBeenCalledWith(updatedRating);
    });

    it('should throw NotFoundException if movie rating to update not found', async () => {
      movieRatingRepository.preload.mockResolvedValue(null);
      await expect(service.update('non-existent', { rating: 1 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should successfully remove a movie rating', async () => {
      movieRatingRepository.delete.mockResolvedValue({ affected: 1 });
      await expect(service.remove('1')).resolves.toBeUndefined();
      expect(movieRatingRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if movie rating to remove not found', async () => {
      movieRatingRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
