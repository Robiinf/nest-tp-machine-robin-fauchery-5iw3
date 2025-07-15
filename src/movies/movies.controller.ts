import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { UpdateWatchStatusDto, WatchStatus } from './dto/update-watch-status.dto';
import { MovieResponseDto, UserMovieResponseDto } from './dto/movie-response.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { EmailVerificationGuard } from '../shared/guards/email-verification.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { RequireEmailVerification } from '../shared/decorators/require-email-verification.decorator';
import { Public } from '../shared/decorators/public.decorator';

interface UserPayload {
  userId: number;
  email: string;
  role: string;
}

@ApiTags('Movies')
@Controller('movies')
@UseGuards(JwtAuthGuard, RolesGuard, EmailVerificationGuard)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  // ===== ENDPOINTS PUBLICS =====

  @Public()
  @Get()
  @ApiOperation({ summary: 'Récupérer tous les films (public)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des films récupérée avec succès',
    type: [MovieResponseDto],
  })
  async findAll(): Promise<MovieResponseDto[]> {
    return this.moviesService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un film par ID (public)' })
  @ApiParam({ name: 'id', description: 'ID du film' })
  @ApiResponse({
    status: 200,
    description: 'Film récupéré avec succès',
    type: MovieResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Film non trouvé' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<MovieResponseDto> {
    return this.moviesService.findOne(id);
  }

  // ===== ENDPOINTS ADMIN =====

  @Post()
  @Roles('ADMIN')
  @RequireEmailVerification()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouveau film (Admin uniquement)' })
  @ApiResponse({
    status: 201,
    description: 'Film créé avec succès',
    type: MovieResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  async create(@Body() createMovieDto: CreateMovieDto): Promise<MovieResponseDto> {
    return this.moviesService.create(createMovieDto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @RequireEmailVerification()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un film (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID du film' })
  @ApiResponse({
    status: 200,
    description: 'Film mis à jour avec succès',
    type: MovieResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  @ApiResponse({ status: 404, description: 'Film non trouvé' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovieDto: UpdateMovieDto,
  ): Promise<MovieResponseDto> {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @RequireEmailVerification()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un film (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID du film' })
  @ApiResponse({ status: 200, description: 'Film supprimé avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin requis' })
  @ApiResponse({ status: 404, description: 'Film non trouvé' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.moviesService.remove(id);
  }

  // ===== ENDPOINTS WATCHLIST UTILISATEUR =====

  @Get('watchlist/my')
  @RequireEmailVerification()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer ma watchlist personnelle' })
  @ApiResponse({
    status: 200,
    description: 'Watchlist récupérée avec succès',
    type: [UserMovieResponseDto],
  })
  async getMyWatchlist(@CurrentUser() user: UserPayload): Promise<UserMovieResponseDto[]> {
    return this.moviesService.getUserWatchlist(user.userId);
  }

  @Get('watchlist/all')
  @RequireEmailVerification()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer tous les films avec mon statut de visionnage' })
  @ApiResponse({
    status: 200,
    description: 'Films avec statut récupérés avec succès',
    type: [UserMovieResponseDto],
  })
  async getAllMoviesWithStatus(@CurrentUser() user: UserPayload): Promise<UserMovieResponseDto[]> {
    return this.moviesService.getMoviesWithUserStatus(user.userId);
  }

  @Post(':id/watchlist')
  @RequireEmailVerification()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ajouter un film à ma watchlist' })
  @ApiParam({ name: 'id', description: 'ID du film' })
  @ApiResponse({
    status: 201,
    description: 'Film ajouté à la watchlist avec succès',
    type: UserMovieResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Film non trouvé' })
  @ApiResponse({ status: 409, description: 'Film déjà dans la watchlist' })
  async addToWatchlist(
    @Param('id', ParseIntPipe) movieId: number,
    @CurrentUser() user: UserPayload,
  ): Promise<UserMovieResponseDto> {
    return this.moviesService.addToWatchlist(user.userId, movieId);
  }

  @Patch(':id/watchlist/status')
  @RequireEmailVerification()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour le statut de visionnage d\'un film' })
  @ApiParam({ name: 'id', description: 'ID du film' })
  @ApiResponse({
    status: 200,
    description: 'Statut mis à jour avec succès',
    type: UserMovieResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Film non trouvé dans la watchlist' })
  async updateWatchStatus(
    @Param('id', ParseIntPipe) movieId: number,
    @Body() updateWatchStatusDto: UpdateWatchStatusDto,
    @CurrentUser() user: UserPayload,
  ): Promise<UserMovieResponseDto> {
    return this.moviesService.updateWatchStatus(user.userId, movieId, updateWatchStatusDto);
  }

  @Delete(':id/watchlist')
  @RequireEmailVerification()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retirer un film de ma watchlist' })
  @ApiParam({ name: 'id', description: 'ID du film' })
  @ApiResponse({ status: 200, description: 'Film retiré de la watchlist avec succès' })
  @ApiResponse({ status: 404, description: 'Film non trouvé dans la watchlist' })
  async removeFromWatchlist(
    @Param('id', ParseIntPipe) movieId: number,
    @CurrentUser() user: UserPayload,
  ): Promise<{ message: string }> {
    return this.moviesService.removeFromWatchlist(user.userId, movieId);
  }
}
