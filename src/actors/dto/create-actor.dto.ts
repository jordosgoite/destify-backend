import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateActorDto {
  @ApiProperty({ description: 'The name of the actor', example: 'Tom Hanks' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The birth year of the actor',
    example: 1956,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1900) // Reasonable minimum birth year for an actor
  @Max(new Date().getFullYear())
  birthYear?: number;
}
