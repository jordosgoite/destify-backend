import { Test, TestingModule } from '@nestjs/testing';
import { ActorsService } from './actors.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Actor } from './entities/actor.entity';
import { Movie } from '../movies/entities/movie.entity'; // For the findMoviesByActor method test
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';

const mockActorRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

const mockMovieRepository = () => ({
  // Mock only methods used in ActorsService that interact with MovieRepository
  findOne: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ActorsService', () => {
  let service: ActorsService;
  let actorRepository: MockRepository<Actor>;
  let movieRepository: MockRepository<Movie>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActorsService,
        {
          provide: getRepositoryToken(Actor),
          useValue: mockActorRepository(),
        },
        {
          provide: getRepositoryToken(Movie), // Provide mock for Movie repository
          useValue: mockMovieRepository(),
        },
      ],
    }).compile();

    service = module.get<ActorsService>(ActorsService);
    actorRepository = module.get<MockRepository<Actor>>(getRepositoryToken(Actor));
    movieRepository = module.get<MockRepository<Movie>>(getRepositoryToken(Movie));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create an actor', async () => {
      const createActorDto: CreateActorDto = { name: 'New Actor', birthYear: 1990 };
      const actor = { id: '1', ...createActorDto, movies: [] };

      actorRepository.create.mockReturnValue(actor);
      actorRepository.save.mockResolvedValue(actor);

      expect(await service.create(createActorDto)).toEqual(actor);
      expect(actorRepository.create).toHaveBeenCalledWith(createActorDto);
      expect(actorRepository.save).toHaveBeenCalledWith(actor);
    });
  });

  describe('findAll', () => {
    it('should return an array of actors', async () => {
      const actors = [{ id: '1', name: 'Actor 1', birthYear: 1980, movies: [] }];
      actorRepository.find.mockResolvedValue(actors);
      expect(await service.findAll()).toEqual(actors);
      expect(actorRepository.find).toHaveBeenCalledWith({ relations: ['movies'] });
    });
  });

  describe('findOne', () => {
    it('should return a single actor', async () => {
      const actor = { id: '1', name: 'Actor 1', birthYear: 1980, movies: [] };
      actorRepository.findOne.mockResolvedValue(actor);
      expect(await service.findOne('1')).toEqual(actor);
      expect(actorRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' }, relations: ['movies'] });
    });

    it('should throw NotFoundException if actor not found', async () => {
      actorRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('should return actors matching a search query', async () => {
      const actors = [{ id: '1', name: 'Action Actor', birthYear: 1970, movies: [] }];
      actorRepository.find.mockResolvedValue(actors);
      expect(await service.search('Action')).toEqual(actors);
      expect(actorRepository.find).toHaveBeenCalledWith({ where: { name: expect.any(Object) }, relations: ['movies'] });
    });
  });

  describe('update', () => {
    it('should update an actor', async () => {
      const existingActor = { id: '1', name: 'Old Actor', birthYear: 1980, movies: [] };
      const updatedActor = { ...existingActor, name: 'Updated Actor', birthYear: 1985 };
      const updateActorDto: UpdateActorDto = { name: 'Updated Actor', birthYear: 1985 };

      actorRepository.preload.mockResolvedValue(updatedActor);
      actorRepository.save.mockResolvedValue(updatedActor);

      expect(await service.update('1', updateActorDto)).toEqual(updatedActor);
      expect(actorRepository.preload).toHaveBeenCalledWith({ id: '1', ...updateActorDto });
      expect(actorRepository.save).toHaveBeenCalledWith(updatedActor);
    });

    it('should throw NotFoundException if actor to update not found', async () => {
      actorRepository.preload.mockResolvedValue(null);
      await expect(service.update('non-existent', { name: 'Any' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should successfully remove an actor', async () => {
      actorRepository.delete.mockResolvedValue({ affected: 1 });
      await expect(service.remove('1')).resolves.toBeUndefined();
      expect(actorRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if actor to remove not found', async () => {
      actorRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findMoviesByActor', () => {
    it('should return movies an actor has been in', async () => {
      const movies = [{ id: 'm1', title: 'Movie 1' }];
      const actor = { id: 'a1', name: 'Actor 1', movies: movies };
      actorRepository.findOne.mockResolvedValue(actor);
      expect(await service.findMoviesByActor('a1')).toEqual(movies);
      expect(actorRepository.findOne).toHaveBeenCalledWith({ where: { id: 'a1' }, relations: ['movies'] });
    });

    it('should throw NotFoundException if actor not found when getting movies', async () => {
      actorRepository.findOne.mockResolvedValue(null);
      await expect(service.findMoviesByActor('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
