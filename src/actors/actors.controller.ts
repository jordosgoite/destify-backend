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
import { ActorsService } from './actors.service';
import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiSecurity,
} from '@nestjs/swagger';
import { Actor } from './entities/actor.entity';
import { AuthGuard } from '../common/guards/auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { Movie } from '../movies/entities/movie.entity';

@ApiTags('actors')
@UseGuards(AuthGuard) // Apply AuthGuard globally to all routes in this controller
@Controller('actors')
export class ActorsController {
  constructor(private readonly actorsService: ActorsService) {}

  @Post()
  @ApiSecurity('apiSecret')
  @ApiOperation({ summary: 'Create a new actor' })
  @ApiResponse({
    status: 201,
    description: 'The actor has been successfully created.',
    type: Actor,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized due to missing/invalid API secret.',
  })
  @HttpCode(201)
  create(@Body() createActorDto: CreateActorDto) {
    return this.actorsService.create(createActorDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all actors' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of all actors.',
    type: [Actor],
  })
  findAll() {
    return this.actorsService.findAll();
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search actors by name' })
  @ApiQuery({
    name: 'query',
    description: 'Partial actor name to search for',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of matching actors.',
    type: [Actor],
  })
  search(@Query('query') query: string) {
    return this.actorsService.search(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get an actor by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the actor', type: String })
  @ApiResponse({
    status: 200,
    description: 'Returns the actor with the specified ID.',
    type: Actor,
  })
  @ApiResponse({ status: 404, description: 'Actor not found.' })
  findOne(@Param('id') id: string) {
    return this.actorsService.findOne(id);
  }

  @Public()
  @Get(':id/movies')
  @ApiOperation({ summary: 'Get all movies an actor has been in' })
  @ApiParam({ name: 'id', description: 'The ID of the actor', type: String })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of movies the actor has been in.',
    type: [Movie],
  })
  @ApiResponse({ status: 404, description: 'Actor not found.' })
  findMoviesByActor(@Param('id') id: string) {
    return this.actorsService.findMoviesByActor(id);
  }

  @Put(':id')
  @ApiSecurity('apiSecret')
  @ApiOperation({ summary: 'Update an actor by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the actor to update',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The actor has been successfully updated.',
    type: Actor,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized due to missing/invalid API secret.',
  })
  @ApiResponse({ status: 404, description: 'Actor not found.' })
  update(@Param('id') id: string, @Body() updateActorDto: UpdateActorDto) {
    return this.actorsService.update(id, updateActorDto);
  }

  @Delete(':id')
  @ApiSecurity('apiSecret')
  @ApiOperation({ summary: 'Delete an actor by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the actor to delete',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'The actor has been successfully deleted.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized due to missing/invalid API secret.',
  })
  @ApiResponse({ status: 404, description: 'Actor not found.' })
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.actorsService.remove(id);
  }
}
