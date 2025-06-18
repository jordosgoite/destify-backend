import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Movie } from '../../movies/entities/movie.entity';

@Entity()
export class MovieRating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  rating: number; // e.g., 1-5

  @Column({ nullable: true })
  review: string;

  // Many-to-one relationship with Movie
  @ManyToOne(() => Movie, (movie) => movie.ratings, { onDelete: 'CASCADE' }) // Cascade delete ratings if movie is deleted
  movie: Movie;
}
