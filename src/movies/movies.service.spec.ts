/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Actor } from '../actors/entities/actor.entity';
import { Repository, ILike, In } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  In: jest.fn((value: any[]) => ({
    _type: 'in',
    _value: value,
  })),
  ILike: jest.fn((value: string) => `ILike(${value})`),
}));

const mockMovieRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  delete: jest.fn(),
  preload: jest.fn(),
  count: jest.fn(),
};

const mockActorRepository = {
  findBy: jest.fn(),
};

describe('MoviesService', () => {
  let service: MoviesService;
  let movieRepository: Repository<Movie>;
  let actorRepository: Repository<Actor>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
        {
          provide: getRepositoryToken(Actor),
          useValue: mockActorRepository,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    movieRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
    actorRepository = module.get<Repository<Actor>>(getRepositoryToken(Actor));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a movie', async () => {
      const createMovieDto: CreateMovieDto = {
        title: 'New Movie',
        releaseYear: 2024,
      };
      const movie = { id: '1', ...createMovieDto, actors: [], ratings: [] };

      (movieRepository.create as jest.Mock).mockReturnValue(movie);
      (movieRepository.save as jest.Mock).mockResolvedValue(movie);

      expect(await service.create(createMovieDto)).toEqual(movie);
      expect(movieRepository.create).toHaveBeenCalledWith(createMovieDto);
      expect(movieRepository.save).toHaveBeenCalledWith(movie);
    });

    it('should create a movie and associate actors if actorIds are provided', async () => {
      const actor1 = { id: 'actor1-uuid', name: 'Actor One', birthYear: 1980 };
      const actor2 = { id: 'actor2-uuid', name: 'Actor Two', birthYear: 1985 };
      const createMovieDto: CreateMovieDto = {
        title: 'Movie With Actors',
        releaseYear: 2020,
        actorIds: [actor1.id, actor2.id],
      };
      const movie = {
        id: 'movie-uuid',
        ...createMovieDto,
        actors: [actor1, actor2],
        ratings: [],
      };

      (movieRepository.create as jest.Mock).mockReturnValue(movie);
      (actorRepository.findBy as jest.Mock).mockResolvedValue([actor1, actor2]);
      (movieRepository.save as jest.Mock).mockResolvedValue(movie);

      expect(await service.create(createMovieDto)).toEqual(movie);
      expect(actorRepository.findBy).toHaveBeenCalledWith({
        id: In([actor1.id, actor2.id]),
      });
      expect(movieRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ actors: [actor1, actor2] }),
      );
    });

    it('should throw NotFoundException if some actorIds are not found', async () => {
      const createMovieDto: CreateMovieDto = {
        title: 'Movie With Missing Actor',
        releaseYear: 2021,
        actorIds: ['actor1-uuid', 'non-existent-actor-uuid'],
      };
      (actorRepository.findBy as jest.Mock).mockResolvedValue([
        { id: 'actor1-uuid', name: 'Actor One', birthYear: 1980 },
      ]);

      await expect(service.create(createMovieDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(movieRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of movies', async () => {
      const movies = [
        {
          id: '1',
          title: 'Movie 1',
          releaseYear: 2000,
          actors: [],
          ratings: [],
        },
      ];
      (movieRepository.find as jest.Mock).mockResolvedValue(movies);
      expect(await service.findAll()).toEqual(movies);
      expect(movieRepository.find).toHaveBeenCalledWith({
        relations: ['actors', 'ratings'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a single movie', async () => {
      const movie = {
        id: '1',
        title: 'Movie 1',
        releaseYear: 2000,
        actors: [],
        ratings: [],
      };
      (movieRepository.findOne as jest.Mock).mockResolvedValue(movie);
      expect(await service.findOne('1')).toEqual(movie);
      expect(movieRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['actors', 'ratings'],
      });
    });

    it('should throw NotFoundException if movie not found', async () => {
      (movieRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('search', () => {
    it('should return movies matching a search query', async () => {
      const movies = [
        {
          id: '1',
          title: 'Action Movie',
          releaseYear: 2000,
          actors: [],
          ratings: [],
        },
      ];
      (movieRepository.find as jest.Mock).mockResolvedValue(movies);
      expect(await service.search('Action')).toEqual(movies);
      expect(movieRepository.find).toHaveBeenCalledWith({
        where: { title: ILike('%Action%') },
        relations: ['actors', 'ratings'],
      });
    });
  });

  describe('update', () => {
    it('should update a movie', async () => {
      const existingMovie = {
        id: '1',
        title: 'Old Movie',
        releaseYear: 2000,
        actors: [],
        ratings: [],
      };
      const updatedMovie = {
        ...existingMovie,
        title: 'Updated Movie',
        releaseYear: 2005,
      };
      const updateMovieDto: UpdateMovieDto = {
        title: 'Updated Movie',
        releaseYear: 2005,
      };

      (movieRepository.findOne as jest.Mock).mockResolvedValue(existingMovie);
      (movieRepository.save as jest.Mock).mockResolvedValue(updatedMovie);

      expect(await service.update('1', updateMovieDto)).toEqual(updatedMovie);
      expect(movieRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['actors'],
      });
      expect(movieRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Updated Movie', releaseYear: 2005 }),
      );
    });

    it('should throw NotFoundException if movie to update not found', async () => {
      (movieRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(
        service.update('non-existent', { title: 'Any' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update actors for a movie', async () => {
      const actor1 = { id: 'actor1-uuid', name: 'Actor One', birthYear: 1980 };
      const actor2 = { id: 'actor2-uuid', name: 'Actor Two', birthYear: 1985 };
      const existingMovie = {
        id: 'movie-uuid',
        title: 'Old Movie',
        releaseYear: 2000,
        actors: [actor1],
        ratings: [],
      };
      const updateMovieDto: UpdateMovieDto = { actorIds: [actor2.id] };
      const updatedMovie = { ...existingMovie, actors: [actor2] };

      (movieRepository.findOne as jest.Mock).mockResolvedValue(existingMovie);
      (actorRepository.findBy as jest.Mock).mockResolvedValue([actor2]);
      (movieRepository.save as jest.Mock).mockResolvedValue(updatedMovie);

      expect(await service.update('movie-uuid', updateMovieDto)).toEqual(
        updatedMovie,
      );
      expect(actorRepository.findBy).toHaveBeenCalledWith({
        id: In([actor2.id]),
      });
      expect(movieRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ actors: [actor2] }),
      );
    });

    it('should clear actors if an empty actorIds array is provided', async () => {
      const actor1 = { id: 'actor1-uuid', name: 'Actor One', birthYear: 1980 };
      const existingMovie = {
        id: 'movie-uuid',
        title: 'Old Movie',
        releaseYear: 2000,
        actors: [actor1],
        ratings: [],
      };
      const updateMovieDto: UpdateMovieDto = { actorIds: [] };
      const updatedMovie = { ...existingMovie, actors: [] };

      (movieRepository.findOne as jest.Mock).mockResolvedValue(existingMovie);
      (actorRepository.findBy as jest.Mock).mockResolvedValue([]);
      (movieRepository.save as jest.Mock).mockResolvedValue(updatedMovie);

      expect(await service.update('movie-uuid', updateMovieDto)).toEqual(
        updatedMovie,
      );
      expect(movieRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ actors: [] }),
      );
    });

    it('should throw NotFoundException if some actorIds for update are not found', async () => {
      const existingMovie = {
        id: 'movie-uuid',
        title: 'Old Movie',
        releaseYear: 2000,
        actors: [],
        ratings: [],
      };
      const updateMovieDto: UpdateMovieDto = {
        actorIds: ['actor1-uuid', 'non-existent-actor-uuid'],
      };
      (movieRepository.findOne as jest.Mock).mockResolvedValue(existingMovie);
      (actorRepository.findBy as jest.Mock).mockResolvedValue([
        { id: 'actor1-uuid', name: 'Actor One', birthYear: 1980 },
      ]);

      await expect(
        service.update('movie-uuid', updateMovieDto),
      ).rejects.toThrow(NotFoundException);
      expect(movieRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should successfully remove a movie', async () => {
      (movieRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });
      await expect(service.remove('1')).resolves.toBeUndefined();
      expect(movieRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if movie to remove not found', async () => {
      (movieRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });
      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findActorsInMovie', () => {
    it('should return actors in a movie', async () => {
      const movie = {
        id: '1',
        title: 'Movie',
        releaseYear: 2000,
        actors: [{ id: 'a1', name: 'Actor1' }],
        ratings: [],
      };
      (movieRepository.findOne as jest.Mock).mockResolvedValue(movie);
      expect(await service.findActorsInMovie('1')).toEqual(movie.actors);
    });

    it('should throw NotFoundException if movie not found when getting actors', async () => {
      (movieRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findActorsInMovie('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
