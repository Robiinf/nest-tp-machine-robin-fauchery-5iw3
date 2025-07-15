import { ApiProperty } from '@nestjs/swagger';
import { MovieStatus, WatchStatus } from '@prisma/client';

export class MovieResponseDto {
  @ApiProperty({ description: 'ID du film' })
  id: number;

  @ApiProperty({ description: 'Titre du film' })
  title: string;

  @ApiProperty({ description: 'Réalisateur du film', required: false })
  director?: string | null;

  @ApiProperty({ description: 'Année de sortie', required: false })
  releaseYear?: number | null;

  @ApiProperty({ description: 'Genre du film', required: false })
  genre?: string | null;

  @ApiProperty({ description: 'Note du film', required: false })
  rating?: number | null;

  @ApiProperty({ 
    description: 'Statut du film',
    enum: MovieStatus 
  })
  status: MovieStatus;

  @ApiProperty({ description: 'Notes sur le film', required: false })
  notes?: string | null;

  @ApiProperty({ description: 'Date de visionnage', required: false })
  watchedAt?: Date | null;

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;

  @ApiProperty({ description: 'Date de mise à jour' })
  updatedAt: Date;

  @ApiProperty({ description: 'ID de l\'utilisateur propriétaire' })
  userId: number;
}

export class UserMovieResponseDto extends MovieResponseDto {
  @ApiProperty({ 
    description: 'Statut de visionnage de l\'utilisateur',
    enum: WatchStatus,
    required: false 
  })
  watchStatus?: WatchStatus;

  @ApiProperty({ description: 'Date d\'ajout à la watchlist', required: false })
  addedToWatchlistAt?: Date;
}
