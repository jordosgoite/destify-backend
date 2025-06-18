import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Actor } from '../../actors/entities/actor.entity';
import { MovieRating } from '../../movie-ratings/entities/movie-rating.entity';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true }) // Ensure movie titles are unique
  title: string;

  @Column()
  releaseYear: number;

  // Many-to-many relationship with Actor
  // This will create a join table automatically named movie_actors_actor
  @ManyToMany(() => Actor, (actor) => actor.movies, { cascade: true })
  @JoinTable()
  actors: Actor[];

  // One-to-many relationship with MovieRating
  @OneToMany(() => MovieRating, (movieRating) => movieRating.movie, {
    cascade: true,
  })
  ratings: MovieRating[];
}
