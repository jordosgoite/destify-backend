import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMovieRatingDto {
  @ApiProperty({
    description: 'The new rating for the movie (1-5)',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({
    description: 'The new optional review for the movie',
    example: 'Loved it!',
    required: false,
  })
  @IsOptional()
  @IsString()
  review?: string;
}
