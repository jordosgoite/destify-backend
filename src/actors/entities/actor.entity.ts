import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Movie } from '../../movies/entities/movie.entity';

@Entity()
export class Actor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true }) // Ensure actor names are unique
  name: string;

  @Column({ nullable: true })
  birthYear: number;

  // Many-to-many relationship with Movie
  // 'movie => movie.actors' specifies the inverse side of the relationship
  @ManyToMany(() => Movie, (movie) => movie.actors)
  movies: Movie[];
}
