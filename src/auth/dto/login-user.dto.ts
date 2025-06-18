import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ description: 'The username for login', example: 'testuser' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: 'The password for login',
    example: 'password123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
