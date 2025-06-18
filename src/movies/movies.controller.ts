import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiSecurity,
} from '@nestjs/swagger';
import { Movie } from './entities/movie.entity';
import { AuthGuard } from '../common/guards/auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { Actor } from '../actors/entities/actor.entity';

@ApiTags('movies')
@UseGuards(AuthGuard) // Apply AuthGuard globally to all routes in this controller
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @ApiSecurity('apiSecret') // Marks this endpoint as requiring 'apiSecret' for Swagger UI
  @ApiOperation({ summary: 'Create a new movie' })
  @ApiResponse({
    status: 201,
    description: 'The movie has been successfully created.',
    type: Movie,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized due to missing/invalid API secret.',
  })
  @HttpCode(201)
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Public() // Mark this endpoint as public, bypassing AuthGuard
  @Get()
  @ApiOperation({ summary: 'Get all movies' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of all movies.',
    type: [Movie],
  })
  findAll() {
    return this.moviesService.findAll();
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search movies by title' })
  @ApiQuery({
    name: 'query',
    description: 'Partial movie title to search for',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of matching movies.',
    type: [Movie],
  })
  search(@Query('query') query: string) {
    return this.moviesService.search(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a movie by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the movie', type: String })
  @ApiResponse({
    status: 200,
    description: 'Returns the movie with the specified ID.',
    type: Movie,
  })
  @ApiResponse({ status: 404, description: 'Movie not found.' })
  findOne(@Param('id') id: string) {
    return this.moviesService.findOne(id);
  }

  @Public()
  @Get(':id/actors')
  @ApiOperation({ summary: 'Get all actors in a specific movie' })
  @ApiParam({ name: 'id', description: 'The ID of the movie', type: String })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of actors in the specified movie.',
    type: [Actor],
  })
  @ApiResponse({ status: 404, description: 'Movie not found.' })
  findActorsInMovie(@Param('id') id: string) {
    return this.moviesService.findActorsInMovie(id);
  }

  @Put(':id')
  @ApiSecurity('apiSecret')
  @ApiOperation({ summary: 'Update a movie by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the movie to update',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The movie has been successfully updated.',
    type: Movie,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized due to missing/invalid API secret.',
  })
  @ApiResponse({ status: 404, description: 'Movie not found.' })
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Delete(':id')
  @ApiSecurity('apiSecret')
  @ApiOperation({ summary: 'Delete a movie by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the movie to delete',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'The movie has been successfully deleted.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized due to missing/invalid API secret.',
  })
  @ApiResponse({ status: 404, description: 'Movie not found.' })
  @HttpCode(204) // No content
  remove(@Param('id') id: string) {
    return this.moviesService.remove(id);
  }
}
