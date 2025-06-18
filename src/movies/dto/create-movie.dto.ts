import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty({ description: 'The title of the movie', example: 'Inception' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'The release year of the movie', example: 2010 })
  @IsNotEmpty()
  @IsInt()
  @Min(1888) // First movie ever was 1888
  @Max(new Date().getFullYear() + 5) // Allow for future releases slightly
  releaseYear: number;

  @ApiProperty({
    description: 'An array of actor IDs to associate with this movie',
    example: ['uuid1', 'uuid2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'Actor IDs array cannot be empty if provided' })
  @IsString({ each: true }) // Each element in the array must be a string (UUID)
  actorIds?: string[];
}
