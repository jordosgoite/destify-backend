import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieRatingDto {
  @ApiProperty({ description: 'The rating for the movie (1-5)', example: 4 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'An optional review for the movie',
    example: 'Really enjoyed this one!',
    required: false,
  })
  @IsOptional()
  @IsString()
  review?: string;

  @ApiProperty({
    description: 'The ID of the movie this rating belongs to',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsNotEmpty()
  @IsUUID()
  movieId: string;
}
