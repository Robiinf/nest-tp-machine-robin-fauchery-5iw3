import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { UpdateWatchStatusDto, WatchStatus } from './dto/update-watch-status.dto';
import { MovieResponseDto, UserMovieResponseDto } from './dto/movie-response.dto';

@Injectable()
export class MoviesService {
  constructor(private prisma: PrismaService) {}

  // ===== GESTION ADMIN DES FILMS =====

  async create(createMovieDto: CreateMovieDto): Promise<MovieResponseDto> {
    const movie = await this.prisma.movie.create({
      data: {
        ...createMovieDto,
        userId: 1, // TODO: get from authenticated user
      },
    });

    return movie;
  }

  async findAll(): Promise<MovieResponseDto[]> {
    const movies = await this.prisma.movie.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return movies;
  }

  async findOne(id: number): Promise<MovieResponseDto> {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
    });

    if (!movie) {
      throw new NotFoundException('Film non trouvé');
    }

    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto): Promise<MovieResponseDto> {
    // Vérifier que le film existe
    await this.findOne(id);

    const updatedMovie = await this.prisma.movie.update({
      where: { id },
      data: updateMovieDto,
    });

    return updatedMovie;
  }

  async remove(id: number): Promise<{ message: string }> {
    // Vérifier que le film existe
    await this.findOne(id);

    await this.prisma.movie.delete({
      where: { id },
    });

    return { message: 'Film supprimé avec succès' };
  }

  // ===== GESTION WATCHLIST UTILISATEUR =====

  async getUserWatchlist(userId: number): Promise<UserMovieResponseDto[]> {
    const userMovies = await this.prisma.userMovie.findMany({
      where: { userId },
      include: {
        movie: true,
      },
      orderBy: {
        addedAt: 'desc',
      },
    });

    return userMovies.map(userMovie => ({
      ...userMovie.movie,
      watchStatus: userMovie.status,
      addedToWatchlistAt: userMovie.addedAt,
    }));
  }

  async addToWatchlist(
    userId: number,
    movieId: number,
    status: WatchStatus = WatchStatus.WANT_TO_WATCH,
  ): Promise<UserMovieResponseDto> {
    // Vérifier que le film existe
    const movie = await this.findOne(movieId);

    // Vérifier si le film n'est pas déjà dans la watchlist
    const existingUserMovie = await this.prisma.userMovie.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    if (existingUserMovie) {
      throw new ForbiddenException('Ce film est déjà dans votre watchlist');
    }

    const userMovie = await this.prisma.userMovie.create({
      data: {
        userId,
        movieId,
        status,
      },
      include: {
        movie: true,
      },
    });

    return {
      ...userMovie.movie,
      watchStatus: userMovie.status,
      addedToWatchlistAt: userMovie.addedAt,
    };
  }

  async updateWatchStatus(
    userId: number,
    movieId: number,
    updateWatchStatusDto: UpdateWatchStatusDto,
  ): Promise<UserMovieResponseDto> {
    // Vérifier que le film existe dans la watchlist de l'utilisateur
    const userMovie = await this.prisma.userMovie.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
      include: {
        movie: true,
      },
    });

    if (!userMovie) {
      throw new NotFoundException('Ce film n\'est pas dans votre watchlist');
    }

    const updatedUserMovie = await this.prisma.userMovie.update({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
      data: {
        status: updateWatchStatusDto.status,
      },
      include: {
        movie: true,
      },
    });

    return {
      ...updatedUserMovie.movie,
      watchStatus: updatedUserMovie.status,
      addedToWatchlistAt: updatedUserMovie.addedAt,
    };
  }

  async removeFromWatchlist(userId: number, movieId: number): Promise<{ message: string }> {
    // Vérifier que le film existe dans la watchlist de l'utilisateur
    const userMovie = await this.prisma.userMovie.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    if (!userMovie) {
      throw new NotFoundException('Ce film n\'est pas dans votre watchlist');
    }

    await this.prisma.userMovie.delete({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    return { message: 'Film retiré de votre watchlist avec succès' };
  }

  // ===== FONCTIONS UTILITAIRES =====

  async getMoviesWithUserStatus(userId: number): Promise<UserMovieResponseDto[]> {
    const movies = await this.prisma.movie.findMany({
      include: {
        userMovies: {
          where: { userId },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return movies.map(movie => ({
      ...movie,
      watchStatus: movie.userMovies[0]?.status,
      addedToWatchlistAt: movie.userMovies[0]?.addedAt,
    }));
  }
}
