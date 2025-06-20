import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { MovieRatingsService } from './movie-ratings.service';
import { CreateMovieRatingDto } from './dto/create-movie-rating.dto';
import { UpdateMovieRatingDto } from './dto/update-movie-rating.dto';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiSecurity,
} from '@nestjs/swagger';
import { MovieRating } from './entities/movie-rating.entity';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('movie-ratings')
@Controller('movie-ratings')
export class MovieRatingsController {
  constructor(private readonly movieRatingsService: MovieRatingsService) {}

  @Post()
  @ApiSecurity('apiSecret')
  @ApiOperation({ summary: 'Create a new movie rating' })
  @ApiResponse({
    status: 201,
    description: 'The movie rating has been successfully created.',
    type: MovieRating,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized due to missing/invalid API secret.',
  })
  @ApiResponse({
    status: 404,
    description: 'Movie not found for the given movieId.',
  })
  @HttpCode(201)
  create(@Body() createMovieRatingDto: CreateMovieRatingDto) {
    return this.movieRatingsService.create(createMovieRatingDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all movie ratings' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of all movie ratings.',
    type: [MovieRating],
  })
  findAll() {
    return this.movieRatingsService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a movie rating by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the movie rating',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the movie rating with the specified ID.',
    type: MovieRating,
  })
  @ApiResponse({ status: 404, description: 'Movie rating not found.' })
  findOne(@Param('id') id: string) {
    return this.movieRatingsService.findOne(id);
  }

  @Put(':id')
  @ApiSecurity('apiSecret')
  @ApiOperation({ summary: 'Update a movie rating by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the movie rating to update',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The movie rating has been successfully updated.',
    type: MovieRating,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized due to missing/invalid API secret.',
  })
  @ApiResponse({ status: 404, description: 'Movie rating not found.' })
  update(
    @Param('id') id: string,
    @Body() updateMovieRatingDto: UpdateMovieRatingDto,
  ) {
    return this.movieRatingsService.update(id, updateMovieRatingDto);
  }

  @Delete(':id')
  @ApiSecurity('apiSecret')
  @ApiOperation({ summary: 'Delete a movie rating by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the movie rating to delete',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'The movie rating has been successfully deleted.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized due to missing/invalid API secret.',
  })
  @ApiResponse({ status: 404, description: 'Movie rating not found.' })
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.movieRatingsService.remove(id);
  }
}
