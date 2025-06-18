import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Actor } from './entities/actor.entity';
import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';
import { Movie } from '../movies/entities/movie.entity';

@Injectable()
export class ActorsService {
  constructor(
    @InjectRepository(Actor)
    private readonly actorRepository: Repository<Actor>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  // Create a new actor
  async create(createActorDto: CreateActorDto): Promise<Actor> {
    const actor = this.actorRepository.create(createActorDto);
    return this.actorRepository.save(actor);
  }

  // Get all actors
  async findAll(): Promise<Actor[]> {
    return this.actorRepository.find({ relations: ['movies'] });
  }

  // Get an actor by ID
  async findOne(id: string): Promise<Actor> {
    const actor = await this.actorRepository.findOne({
      where: { id },
      relations: ['movies'],
    });
    if (!actor) {
      throw new NotFoundException(`Actor with ID "${id}" not found.`);
    }
    return actor;
  }

  // Search actors by name (partial and case-insensitive)
  async search(query: string): Promise<Actor[]> {
    return this.actorRepository.find({
      where: { name: ILike(`%${query}%`) },
      relations: ['movies'],
    });
  }

  // Get all movies an actor has been in
  async findMoviesByActor(actorId: string): Promise<Movie[]> {
    const actor = await this.actorRepository.findOne({
      where: { id: actorId },
      relations: ['movies'],
    });
    if (!actor) {
      throw new NotFoundException(`Actor with ID "${actorId}" not found.`);
    }
    return actor.movies;
  }

  // Update an actor
  async update(id: string, updateActorDto: UpdateActorDto): Promise<Actor> {
    const actor = await this.actorRepository.preload({ id, ...updateActorDto });
    if (!actor) {
      throw new NotFoundException(`Actor with ID "${id}" not found.`);
    }
    return this.actorRepository.save(actor);
  }

  // Delete an actor
  async remove(id: string): Promise<void> {
    const result = await this.actorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Actor with ID "${id}" not found.`);
    }
  }
}
