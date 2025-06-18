import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMovieDto {
  @ApiProperty({
    description: 'The new title of the movie',
    example: 'Inception 2.0',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'The new release year of the movie',
    example: 2011,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1888)
  @Max(new Date().getFullYear() + 5)
  releaseYear?: number;

  @ApiProperty({
    description: 'An array of actor IDs to update associations for this movie',
    example: ['uuid3', 'uuid4'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'Actor IDs array cannot be empty if provided' })
  @IsString({ each: true })
  actorIds?: string[];
}
